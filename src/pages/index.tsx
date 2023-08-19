import Head from "next/head";

import GuessTheLyrics from "@/components/GuessTheLyrics";
import { api } from "@/utils/api";

export default function Home() {
  const songData = api.lyrics.mock.useQuery();
  return (
    <>
      <Head>
        <title>guess the lyrics</title>
        <meta name="description" content="guess the lyrics game" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="mx-10vw container flex max-w-5xl flex-col items-center justify-center gap-6 px-4 py-12">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[4rem]">
            {songData.data ? songData.data.title : "Loading song..."}
          </h1>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-[2rem]">
            {songData.data ? songData.data.artist : "Loading artist..."}
          </h2>
          <p className="text-xl">
            {songData.data ? songData.data.album : "Loading album..."}
          </p>
          {songData.data && <GuessTheLyrics lyrics={songData.data.lyrics} />}
        </div>
      </main>
    </>
  );
}
