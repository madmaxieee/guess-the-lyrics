"use client";

import { Shuffle } from "lucide-react";

import { Button } from "@/components/ui/button";

type RandomButtonProps = {
  createRandomGame: () => Promise<void>;
};

export default function RandomButton({ createRandomGame }: RandomButtonProps) {
  return (
    <Button
      size="sm"
      onClick={() => {
        createRandomGame().catch(console.error);
      }}
    >
      <Shuffle className="mr-2" size="1.25em" /> Random
    </Button>
  );
}
