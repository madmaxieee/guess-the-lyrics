import Head from "next/head";

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
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="mx-10vw container flex max-w-5xl flex-col items-center justify-center gap-12 px-4 py-12">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            {songData.data ? songData.data.title : "Loading song..."}
          </h1>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-[3rem]">
            {songData.data ? songData.data.artist : "Loading artist..."}
          </h2>
          <p className="text-xl text-white">
            {songData.data ? songData.data.lyrics : "Loading lyrics..."}
          </p>
        </div>
      </main>
    </>
  );
}
