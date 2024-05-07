import { cn } from "@/utils/ui";

type WordDisplayProps = {
  word: string;
  isGameEnded: boolean;
  isLastCorrectWord: boolean;
  isGuessedWord: boolean;
  isCorrectWord: boolean;
};

export default function WordDisplay({
  word,
  isGameEnded,
  isCorrectWord,
  isLastCorrectWord,
  isGuessedWord,
}: WordDisplayProps) {
  if (word === "\n") {
    return <br />;
  }
  return (
    <span
      className={cn({
        "text-red-500": isGameEnded && !isCorrectWord,
        "text-green-500": !isGameEnded && isLastCorrectWord,
        "text-yellow-500": !isGameEnded && isGuessedWord,
      })}
    >
      {isGameEnded || isCorrectWord ? word : hideWord(word)}{" "}
    </span>
  );
}

function hideWord(word: string) {
  let hiddenWord = "";
  for (const c of word) {
    if (/[a-zA-Z0-9]{1}/.test(c)) {
      hiddenWord += "_";
    } else {
      hiddenWord += c;
    }
  }
  return hiddenWord;
}
