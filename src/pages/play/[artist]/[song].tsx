import { useRouter } from "next/router";

import GuessTheLyrics from "@/components/GuessTheLyrics";
import { api } from "@/utils/api";

export default function GamePage() {
  const router = useRouter();
  const id = `${router.query.artist as string}/${router.query.song as string}`;
  const songData = api.lyrics.fromAZid.useQuery({ id });
  // const songData = api.mock.songData.useQuery();

  if (songData.isError) {
    router.push("/").catch(console.error);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      {songData.isLoading ? (
        <p>Loading...</p>
      ) : songData.isError ? (
        <p>Error: {songData.error.message}</p>
      ) : songData.data ? (
        <GuessTheLyrics songData={songData.data} />
      ) : null}
    </main>
  );
}
