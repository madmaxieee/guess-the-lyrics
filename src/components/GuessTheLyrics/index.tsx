import { useEffect, useMemo, useRef, useState } from "react";

import { Skeleton } from "../ui/skeleton";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useImmer } from "use-immer";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { api } from "@/utils/api";
import { MIN_PLAYTIME_SECONDS } from "@/utils/constants";
import { type RouterOutput } from "@/utils/routerTypes";
import { cn } from "@/utils/ui";

import Timer from "./Timer";

type GuessTheLyricsProps = {
  songData: Exclude<RouterOutput["lyrics"]["fromAZpath"], null>;
  path: string;
};

export default function GuessTheLyrics({
  songData: { lyrics, title, artist, album, coverPhotoURL: coverPhoto },
  path,
}: GuessTheLyricsProps) {
  const [score, setScore] = useState(0);
  const [currentWord, setCurrentWord] = useState("");
  const [gameState, setGameState] = useState<
    "NOT_STARTED" | "RUNNING" | "PAUSED" | "ENDED"
  >("NOT_STARTED");
  const [showWinDialog, setShowWinDialog] = useState(false);

  const answerArray = useMemo(() => lyrics.split(/\s+/), [lyrics]);
  const totalWords = useMemo(() => answerArray.length, [answerArray]);
  const answerMap = useMemo(() => {
    const map: Record<string, number[]> = {};
    answerArray.forEach((word, index) => {
      const key = toKey(word);
      map[key] ??= [];
      map[key]!.push(index);
    });
    return map;
  }, [answerArray]);

  const [isCorrect, setIsCorrect] = useImmer<boolean[]>(
    answerArray.map(() => false)
  );
  const [lastCorrect, setLastCorrect] = useState<Set<number>>(new Set());

  const startGame = api.lyrics.start.useMutation();
  const countPlay = api.lyrics.count.useMutation();
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
    if (answerMap[key]) {
      const correctIndices = [...answerMap[key]!];

      setLastCorrect(new Set(correctIndices));

      setIsCorrect((draft) => {
        correctIndices.forEach((index) => {
          draft[index] = true;
        });
      });

      const newScore = score + correctIndices.length;
      setScore(newScore);
      if (newScore === totalWords) {
        setGameState("ENDED");
        setShowWinDialog(true);
      }

      setCurrentWord("");

      delete answerMap[key];
    } else {
      setCurrentWord(word);
    }
  };

  return (
    <>
      <div className="mx-10vw container flex max-w-5xl flex-col items-center justify-center gap-6 px-4 py-12">
        <div className="flex justify-between gap-12">
          {coverPhoto && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverPhoto}
              alt="Album cover"
              className="h-56 w-56 rounded-xl"
            />
          )}
          <div className="flex max-w-5xl flex-col justify-center gap-4">
            <h1 className="my-6 text-6xl font-extrabold">{title}</h1>
            <h2 className="text-4xl font-extrabold">{artist}</h2>
            <p className="text-3xl">{album}</p>
          </div>
        </div>
        <div className="flex w-full items-center gap-8 px-16">
          <Input
            disabled={gameState === "ENDED"}
            value={currentWord}
            onChange={(e) => updateCurrentWord(e.target.value)}
            className="grow text-xl"
          />
          <p className="w-64 text-right text-4xl font-bold">
            {score}/{totalWords}
          </p>
          <Timer
            duration={getDuration(totalWords)}
            running={gameState === "RUNNING"}
            className="text-center font-mono text-4xl"
            onEnd={() => setGameState("ENDED")}
          />
          {gameState === "ENDED" ? (
            <Button
              className="whitespace-nowrap"
              variant="default"
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
        <p className="font-mono text-xl text-gray-500">
          {answerArray.map((word, index) => (
            <span
              key={index}
              className={cn(
                gameState === "ENDED" && !isCorrect[index]
                  ? "text-red-500"
                  : gameState !== "ENDED" && lastCorrect.has(index)
                  ? "text-green-500"
                  : null
              )}
            >
              {gameState === "ENDED" || isCorrect[index]
                ? word + " "
                : "_".repeat(word.length) + " "}
            </span>
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
    <div className="mx-10vw container flex max-w-5xl flex-col items-center justify-center gap-6 px-4 py-12">
      <div className="flex justify-between gap-12">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <Skeleton className="h-56 w-56 rounded-xl" />
        <div className="flex max-w-5xl flex-col justify-center gap-4">
          <Skeleton className="my-6 h-16 w-96" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-32" />
        </div>
      </div>
      <div className="flex w-full items-center gap-8 px-16">
        <Input className="grow text-xl" disabled />
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-10 w-56" />
        <Button className="whitespace-nowrap" variant="destructive" disabled>
          give up
        </Button>
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
