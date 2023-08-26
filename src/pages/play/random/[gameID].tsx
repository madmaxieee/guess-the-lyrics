import Head from "next/head";
import { useRouter } from "next/router";

import GuessTheLyrics, {
  GuessTheLyricsSkeleton,
} from "@/components/GuessTheLyrics";
import Header from "@/components/Header";
import SEO from "@/components/SEO";
import { api } from "@/utils/api";

export default function GamePage() {
  const router = useRouter();
  const { gameID } = router.query;
  // const songData = api.mock.songData.useQuery();
  const songData = api.game.getRandom.useQuery({
    randomGameID: gameID as string,
  });

  return (
    <>
      <Head>
        <title>guess the lyrics.</title>
        <SEO />
      </Head>
      <main className="flex min-h-screen flex-col items-center">
        <Header />
        {songData.isLoading ? (
          <GuessTheLyricsSkeleton />
        ) : songData.isError ? (
          <div className="mt-[30vh] text-center">
            <h1 className="text-4xl font-bold">Error</h1>
            <p className="text-xl">{songData.error?.message}</p>
          </div>
        ) : songData.data ? (
          <GuessTheLyrics
            songData={songData.data}
            path={songData.data.path}
            hideInfo
          />
        ) : null}
      </main>
    </>
  );
}
