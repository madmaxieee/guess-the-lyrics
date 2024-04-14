import { Suspense } from "react";

import { revalidatePath } from "next/cache";
import Image from "next/image";
import { redirect } from "next/navigation";

import bannerImage from "@/assets/banner.svg";
import { SearchResultSkeleton } from "@/components/SearchResult";
import { Separator } from "@/components/ui/separator";

import SearchBar from "./_components/SearchBar";
import SearchResults from "./_components/SearchResults";

type SearchMode = "songs" | "artists";

export default function Home({
  searchParams: { searchMode = "songs", query = "" },
}) {
  const search = async (query: string, searchMode: SearchMode) => {
    "use server";
    revalidatePath("/");
    redirect(
      `/?query=${encodeURIComponent(query)}&mode=${encodeURIComponent(
        searchMode
      )}`
    );
  };
  if (searchMode !== "songs" && searchMode !== "artists") {
    searchMode = "songs";
  }
  return (
    <>
      <Image
        priority
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        src={bannerImage}
        className="mx-auto mt-8 max-w-4xl max-sm:w-full"
        alt="Are you a real fan? guess the lyrics!"
      />
      <div className="mx-auto my-8 w-full max-w-4xl text-xl max-md:px-6">
        <SearchBar search={search} defaultValue={query} />
        <Suspense
          fallback={
            <ul className="mx-auto flex max-w-2xl flex-col gap-3 max-md:gap-2">
              {Array.from(Array(10), (_, index) => (
                <li key={index}>
                  <SearchResultSkeleton />
                  <Separator className="mt-3 max-md:mt-1.5" />
                </li>
              ))}
            </ul>
          }
        >
          <SearchResults searchMode={searchMode as SearchMode} query={query} />
        </Suspense>
      </div>
    </>
  );
}
