"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

type SearchMode = "songs" | "artists";
type SearchBarProps = {
  search: (query: string, searchMode: SearchMode) => Promise<void>;
  defaultMode: SearchMode;
  defaultQuery: string;
};

export default function SearchBar({
  search,
  defaultMode,
  defaultQuery,
}: SearchBarProps) {
  const [searchMode, setSearchMode] = useState<SearchMode>(defaultMode);
  const searchBoxRef = useRef<HTMLInputElement>(null);

  const handleSearch = () => {
    if (searchBoxRef.current?.value) {
      search(searchBoxRef.current.value, searchMode).catch(console.error);
    }
  };

  useEffect(() => {
    searchBoxRef.current?.focus();
  }, []);

  useEffect(() => {
    setSearchMode(defaultMode);
  }, [defaultMode]);

  return (
    <div className="my-6 flex justify-center gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-16">
            {searchMode}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center">
          <DropdownMenuItem onClick={() => setSearchMode("songs")}>
            songs
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSearchMode("artists")}>
            artists
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Input
        className="grow md:w-72 md:grow-0"
        ref={searchBoxRef}
        onKeyUp={(e) => e.key === "Enter" && handleSearch()}
        defaultValue={defaultQuery}
      />
      <Button onClick={handleSearch}>search</Button>
    </div>
  );
}
