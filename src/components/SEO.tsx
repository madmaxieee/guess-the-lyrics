import { env } from "@/env.mjs";

export default function SEO() {
  return (
    <>
      <meta name="description" content="guess the lyrics." />
      <link rel="icon" href="/favicon.ico" />
      <meta
        name="keywords"
        content="guess the lyrics, guess, lyrics, game, music, songs, lyrics game, swiftie"
      />
      <meta property="og:type" content="website" />
      <meta property="og:title" content="guess the lyrics." />
      <meta
        property="og:description"
        content="Are you a real fan? Try to guess the lyrics of your favorite songs now! Challenge your friends and see who's the real one!"
      />
      <meta
        property="og:image"
        content={env.NEXT_PUBLIC_DOMAIN + "/og-image.png"}
      />
      <meta property="og:image:width" content="1600" />
      <meta property="og:image:height" content="800" />
      <meta
        property="og:image:alt"
        content="guess the lyrics. Are you a real fan?"
      />
      <meta property="og:site_name" content="guess the lyrics." />
      <meta property="og:locale" content="en_US" />
      <link rel="canonical" href={env.NEXT_PUBLIC_DOMAIN} />
    </>
  );
}
