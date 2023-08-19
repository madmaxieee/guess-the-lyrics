import { useEffect, useRef, useState } from "react";

import { useImmer } from "use-immer";

import { Input } from "./ui/input";

type GuessTheLyricsProps = {
  lyrics: string;
};

export default function GuessTheLyrics({ lyrics }: GuessTheLyricsProps) {
  const [score, setScore] = useState(0);
  const [currentWord, setCurrentWord] = useState("");
  const answerRef = useRef(lyrics.split(/\s+/));
  const answerMap = useRef<Record<string, number[]>>({});
  const [isCorrect, setIsCorrect] = useImmer<boolean[]>(
    answerRef.current.map(() => false)
  );

  useEffect(() => {
    answerRef.current.forEach((word, index) => {
      const key = word.toLowerCase().replace(/[^a-z]/g, "");
      answerMap.current[key] ??= [];
      answerMap.current[key]!.push(index);
    });
  }, []);

  const totalWords = answerRef.current.length;

  const updateCurrentWord = (word: string) => {
    const key = word.toLowerCase().replace(/[^a-z]/g, "");
    if (key in answerMap.current) {
      const correctIndices = [...answerMap.current[key]!];
      setIsCorrect((draft) => {
        correctIndices.forEach((index) => {
          draft[index] = true;
        });
      });
      const newScore = score + answerMap.current[key]!.length;
      setScore(newScore);
      if (newScore === totalWords) {
        alert("You win!");
      }
      setCurrentWord("");
      delete answerMap.current[key];
    } else {
      setCurrentWord(word);
    }
  };

  return (
    <div>
      <p>
        {score}/{totalWords}
      </p>
      <Input
        value={currentWord}
        onChange={(e) => updateCurrentWord(e.target.value)}
      />
      <p className="text-xl text-white">
        {answerRef.current.map((word, index) => (
          <span key={index} className="font-mono text-gray-500">
            {isCorrect[index] ? word + " " : "_".repeat(word.length) + " "}
          </span>
        ))}
      </p>
    </div>
  );
}
