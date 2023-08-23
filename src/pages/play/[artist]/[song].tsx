import { useRouter } from "next/router";

import GuessTheLyrics, {
  GuessTheLyricsSkeleton,
} from "@/components/GuessTheLyrics";
import Header from "@/components/Header";
import { api } from "@/utils/api";

export default function GamePage() {
  const router = useRouter();
  const { artist, song } = router.query;
  const path = artist && song ? `${artist as string}/${song as string}` : null;
  const songData = api.lyrics.fromAZpath.useQuery({ path });
  // const songData = api.mock.songData.useQuery();

  if (songData.isError) {
    router.push("/").catch(console.error);
  }

  return (
    <main className="flex min-h-screen flex-col items-center">
      <Header />
      {songData.isLoading ? (
        <GuessTheLyricsSkeleton />
      ) : songData.isError ? (
        <p>Error: {songData.error.message}</p>
      ) : songData.data && path ? (
        <GuessTheLyrics songData={songData.data} path={path} />
      ) : null}
    </main>
  );
}
