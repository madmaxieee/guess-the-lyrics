import { useEffect, useMemo, useRef, useState } from "react";

import { Skeleton } from "../ui/skeleton";
import { DialogDescription } from "@radix-ui/react-dialog";
import { Eye, EyeOff } from "lucide-react";
import { useImmer } from "use-immer";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { api } from "@/utils/api";
import { MIN_PLAYTIME_SECONDS } from "@/utils/constants";
import { type RouterOutput } from "@/utils/routerTypes";

import Timer from "./Timer";
import WordDisplay from "./WordDisplay";

type GuessTheLyricsProps = {
  songData: Exclude<RouterOutput["lyrics"]["fromAZpath"], null>;
  path: string;
  hideInfo?: boolean;
};

export default function GuessTheLyrics({
  songData: { lyrics, title, artist, album, coverPhotoURL },
  path,
  hideInfo: initialHideInfo,
}: GuessTheLyricsProps) {
  const [score, setScore] = useState(0);
  const [currentWord, setCurrentWord] = useState("");
  const [gameState, setGameState] = useState<
    "NOT_STARTED" | "RUNNING" | "PAUSED" | "ENDED"
  >("NOT_STARTED");
  const [showWinDialog, setShowWinDialog] = useState(false);
  const [hideInfo, setHideInfo] = useState(initialHideInfo ?? false);

  const answerArray = useMemo(
    () =>
      lyrics
        .split("\n")
        .reduce((acc, line) => {
          const words = line.split(" ");
          words.push("\n");
          acc.push(...words);
          return acc;
        }, [] as string[])
        .filter((w) => w !== ""),
    [lyrics]
  );
  const totalWords = useMemo(
    () => answerArray.filter((w) => w !== "\n").length,
    [answerArray]
  );
  const wordsMap = useMemo(() => {
    const map: Record<string, number[]> = {};
    answerArray.forEach((word, index) => {
      const key = toKey(word);
      if (key === "") return;
      map[key] ??= [];
      map[key]!.push(index);
    });
    return map;
  }, [answerArray]);
  const answerMap = useMemo(() => {
    const map: Record<string, number[]> = {};
    answerArray.forEach((word, index) => {
      const key = toKey(word);
      if (key === "") return;
      map[key] ??= [];
      map[key]!.push(index);
    });
    return map;
  }, [answerArray]);

  const [isCorrect, setIsCorrect] = useImmer<boolean[]>(
    answerArray.map(() => false)
  );
  const [lastCorrect, setLastCorrect] = useState<Set<number>>(new Set());
  const [guessedWords, setGuessedWords] = useState<Set<number>>(new Set());

  const startGame = api.game.start.useMutation();
  const countPlay = api.game.count.useMutation();
  const timeoutRef = useRef<NodeJS.Timeout>();
  useEffect(() => {
    if (gameState === "RUNNING" && !timeoutRef.current) {
      startGame.mutate({ path });
      timeoutRef.current = setTimeout(() => {
        countPlay.mutate({ path });
      }, (MIN_PLAYTIME_SECONDS + 3) * 1000);
    } else if (gameState === "ENDED" && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, [gameState, path, countPlay, startGame]);

  const updateCurrentWord = (word: string) => {
    if (gameState === "NOT_STARTED") setGameState("RUNNING");

    const key = toKey(word);

    if (key in answerMap) {
      const correctIndices = [...answerMap[key]!];

      setLastCorrect(new Set(correctIndices));
      setGuessedWords(new Set());

      setIsCorrect((draft) => {
        correctIndices.forEach((index) => {
          draft[index] = true;
        });
      });

      setScore((_score) => _score + correctIndices.length);
      setCurrentWord("");

      delete answerMap[key];

      if (Object.keys(answerMap).length == 0) {
        setGameState("ENDED");
        setShowWinDialog(true);
      }
    } else if (key in wordsMap) {
      const guessedIndices = [...wordsMap[key]!];
      setLastCorrect(new Set());
      setGuessedWords(new Set(guessedIndices));
      setCurrentWord(word);
    } else {
      setCurrentWord(word);
    }
  };

  return (
    <>
      <div className="mx-10vw container relative flex max-w-5xl flex-col items-center justify-center gap-6 px-4 py-12 max-md:gap-4 max-md:py-6">
        {initialHideInfo && (
          <Button
            size="icon"
            variant="outline"
            className="absolute left-8 top-8"
            onClick={() => setHideInfo(!hideInfo)}
          >
            {hideInfo ? <Eye size="1.25em" /> : <EyeOff size="1.25em" />}
          </Button>
        )}
        <div className="flex justify-between gap-12 max-md:mx-1 max-md:gap-6">
          {hideInfo && gameState !== "ENDED" ? (
            <>
              <div className="h-56 w-56 rounded-xl bg-muted max-md:h-40 max-md:w-40 max-md:rounded-md" />
              <div className="flex max-w-5xl flex-col justify-center gap-4 max-md:gap-2">
                <div className="my-6 h-16 w-96 rounded-md bg-muted max-md:my-0 max-md:h-10 max-md:w-40" />
                <div className="h-8 w-48 rounded-md bg-muted max-md:h-8 max-md:w-32" />
                <div className="h-8 w-32 rounded-md bg-muted max-md:h-6 max-md:w-28" />
              </div>
            </>
          ) : (
            <>
              {coverPhotoURL && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={coverPhotoURL}
                  alt="Album cover"
                  className="h-56 w-56 rounded-xl max-md:h-40 max-md:w-40 max-md:rounded-md"
                />
              )}
              <div className="flex max-w-5xl flex-col justify-center gap-4 max-md:gap-2">
                <h1 className="my-6 text-6xl font-extrabold max-md:my-0 max-md:text-3xl">
                  {title}
                </h1>
                <h2 className="text-4xl font-extrabold max-md:text-2xl">
                  {artist}
                </h2>
                <p className="text-3xl max-md:text-xl">{album}</p>
              </div>
            </>
          )}
        </div>

        <div className="flex w-full items-center gap-8 px-16 max-md:flex-col max-md:gap-4 max-md:px-4">
          <Input
            disabled={gameState === "ENDED"}
            value={currentWord}
            onChange={(e) => updateCurrentWord(e.target.value)}
            className="hidden grow text-xl md:block"
          />
          <div className="flex gap-8 max-md:w-full max-md:justify-center max-md:gap-6">
            <p className="w-32 text-right text-4xl font-bold max-md:text-3xl">
              {score}/{totalWords}
            </p>
            <Timer
              duration={getDuration(totalWords)}
              running={gameState === "RUNNING"}
              className="text-center font-mono text-4xl max-md:text-3xl"
              onEnd={() => setGameState("ENDED")}
            />
            {gameState === "ENDED" ? (
              <Button
                className="whitespace-nowrap"
                variant="default"
                size="sm"
                onClick={() => {
                  setGameState("NOT_STARTED");
                  setScore(0);
                  setCurrentWord("");
                  setIsCorrect(answerArray.map(() => false));
                  setLastCorrect(new Set());
                }}
              >
                restart
              </Button>
            ) : (
              <Button
                className="whitespace-nowrap"
                variant="destructive"
                onClick={() => setGameState("ENDED")}
              >
                give up
              </Button>
            )}
          </div>
          <Input
            disabled={gameState === "ENDED"}
            value={currentWord}
            onChange={(e) => updateCurrentWord(e.target.value)}
            className="hidden grow text-xl max-md:block max-md:w-4/5"
          />
        </div>
        <p className="text-center font-mono text-xl text-gray-500 max-md:mx-2">
          {answerArray.map((word, index) => (
            <WordDisplay
              key={index}
              word={word}
              isCorrectWord={!!isCorrect[index]}
              isGameEnded={gameState === "ENDED"}
              isGuessedWord={guessedWords.has(index)}
              isLastCorrectWord={lastCorrect.has(index)}
            />
          ))}
        </p>
      </div>
      <Dialog open={showWinDialog} onOpenChange={setShowWinDialog}>
        <DialogContent>
          <DialogTitle className="text-3xl">You win!</DialogTitle>
          <DialogDescription className="text-xl">
            {`Now you can brag about your score to your friends! You are a true ${artist} fan!`}
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function GuessTheLyricsSkeleton() {
  return (
    <div className="mx-10vw container flex max-w-5xl flex-col items-center justify-center gap-6 px-4 py-12 max-md:gap-4 max-md:py-6">
      <div className="flex justify-between gap-12 max-md:mx-1 max-md:gap-6">
        <Skeleton className="h-56 w-56 rounded-xl max-md:h-40 max-md:w-40 max-md:rounded-md" />
        <div className="flex max-w-5xl flex-col justify-center gap-4 max-md:gap-2">
          <Skeleton className="my-6 h-16 w-96 max-md:my-0 max-md:h-10 max-md:w-40" />
          <Skeleton className="h-8 w-48 max-md:h-8 max-md:w-32" />
          <Skeleton className="h-8 w-32 max-md:h-6 max-md:w-28" />
        </div>
      </div>
      <div className="flex w-full items-center gap-8 px-16 max-md:flex-col max-md:gap-4 max-md:px-4">
        <Input className="hidden grow text-xl md:block" disabled />
        <div className="flex gap-8 max-md:w-full max-md:justify-center max-md:gap-6">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Button className="whitespace-nowrap" variant="destructive" disabled>
            give up
          </Button>
        </div>
        <Input className="hidden text-xl max-md:block max-md:w-4/5" disabled />
      </div>
      <div className="flex w-full flex-col gap-4">
        {Array.from(Array(15), (_, index) => (
          <Skeleton key={index} className="h-6 w-full" />
        ))}
      </div>
    </div>
  );
}

function toKey(word: string) {
  return word.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getDuration(totalWords: number) {
  return Math.min(Math.ceil(totalWords / 100) * 5 + 5, 60) * 60;
}
