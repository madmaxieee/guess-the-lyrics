import type { TRPCError } from "@trpc/server";

import GuessTheLyrics from "@/components/GuessTheLyrics";
import { api } from "@/trpc/server";
import { makeMetadata } from "@/utils/metadata";

export function generateMetadata() {
  return makeMetadata({});
}

export default async function GamePage({
  params: { gameID },
}: {
  params: { gameID: string };
}) {
  try {
    const songData = await api.game.getRandom({ randomGameID: gameID });
    return <GuessTheLyrics songData={songData} path={songData.path} hideInfo />;
  } catch (error) {
    console.error(error);
    return (
      <div className="mt-[30vh] text-center">
        <h1 className="text-4xl font-bold">Error</h1>
        <p className="text-xl">{(error as TRPCError)?.message}</p>
      </div>
    );
  }
}
