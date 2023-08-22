import { useMemo, useState } from "react";

import { DialogDescription } from "@radix-ui/react-dialog";
import { useImmer } from "use-immer";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { SongData } from "@/utils/azlyricsParser";
import { cn } from "@/utils/ui";

import Timer from "./Timer";

type GuessTheLyricsProps = {
  songData: SongData;
};

export default function GuessTheLyrics({
  songData: { lyrics, title, artist, album, coverPhoto },
}: GuessTheLyricsProps) {
  const [score, setScore] = useState(0);
  const [currentWord, setCurrentWord] = useState("");
  const [running, setRunning] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
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

  const updateCurrentWord = (word: string) => {
    if (!running) setRunning(true);

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
        setGameEnded(true);
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverPhoto}
            alt="Album cover"
            className="h-56 w-56 rounded-xl"
          />
          <div className="flex max-w-5xl flex-col justify-center gap-4">
            <h1 className="my-6 text-6xl font-extrabold">{title}</h1>
            <h2 className="text-4xl font-extrabold">{artist}</h2>
            <p className="text-3xl">{album}</p>
          </div>
        </div>
        <div className="flex w-full items-center gap-8 px-16">
          <Input
            disabled={gameEnded}
            value={currentWord}
            onChange={(e) => updateCurrentWord(e.target.value)}
            className="grow text-xl"
          />
          <p className="w-64 text-right text-4xl font-bold">
            {score}/{totalWords}
          </p>
          <Timer
            duration={getDuration(totalWords)}
            running={gameEnded ? false : running}
            className="text-center font-mono text-4xl"
            onEnd={() => {
              setGameEnded(true);
            }}
          />
          {gameEnded ? (
            <Button
              className="whitespace-nowrap"
              variant="default"
              onClick={() => {
                setGameEnded(false);
                setScore(0);
                setCurrentWord("");
                setRunning(false);
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
              onClick={() => setGameEnded(true)}
            >
              give up
            </Button>
          )}
        </div>
        <p className="text-xl text-white">
          {answerArray.map((word, index) => (
            <span
              key={index}
              className={cn(
                "font-mono",
                gameEnded && !isCorrect[index]
                  ? "text-red-500"
                  : !gameEnded && lastCorrect.has(index)
                  ? "text-green-500"
                  : "text-gray-500"
              )}
            >
              {gameEnded || isCorrect[index]
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

function toKey(word: string) {
  return word.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getDuration(totalWords: number) {
  return Math.min(Math.ceil(totalWords / 100) * 5 + 5, 60) * 60;
}
