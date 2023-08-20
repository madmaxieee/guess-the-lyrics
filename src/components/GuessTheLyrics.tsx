import { useMemo, useState } from "react";

import { useImmer } from "use-immer";

import { cn } from "@/utils";
import type { SongData } from "@/utils/azlyricsParser";

import { Input } from "./ui/input";

type GuessTheLyricsProps = {
  songData: SongData;
};

export default function GuessTheLyrics({
  songData: { lyrics, title, artist, album },
}: GuessTheLyricsProps) {
  const [score, setScore] = useState(0);
  const [currentWord, setCurrentWord] = useState("");

  const answerArray = useMemo(() => lyrics.split(/\s+/), [lyrics]);
  const totalWords = useMemo(() => answerArray.length, [answerArray]);
  const answerMap = useMemo(() => {
    const map: Record<string, number[]> = {};
    answerArray.forEach((word, index) => {
      const key = word.toLowerCase().replace(/[^a-z]/g, "");
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
    const key = word.toLowerCase().replace(/[^a-z]/g, "");
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
        alert("You win!");
      }

      setCurrentWord("");

      delete answerMap[key];
    } else {
      setCurrentWord(word);
    }
  };

  return (
    <div className="mx-10vw container flex max-w-5xl flex-col items-center justify-center gap-6 px-4 py-12">
      <h1 className="text-5xl font-extrabold tracking-tight sm:text-[4rem]">
        {title}
      </h1>
      <h2 className="text-3xl font-extrabold tracking-tight sm:text-[2rem]">
        {artist}
      </h2>
      <p className="text-xl">{album}</p>
      <p>
        {score}/{totalWords}
      </p>
      <Input
        value={currentWord}
        onChange={(e) => updateCurrentWord(e.target.value)}
      />
      <p className="text-xl text-white">
        {answerArray.map((word, index) => (
          <span
            key={index}
            className={cn(
              "font-mono",
              lastCorrect.has(index) ? "text-green-500" : "text-gray-500"
            )}
          >
            {isCorrect[index] ? word + " " : "_".repeat(word.length) + " "}
          </span>
        ))}
      </p>
    </div>
  );
}
