import { env } from "@/env.mjs";

type SEOProps = {
  title?: string | null;
  artist?: string | null;
  coverPhotoUrl?: string | null;
};

export default function SEO({ title, artist, coverPhotoUrl }: SEOProps) {
  const pageTitle = title
    ? `guess the lyrics. | ${title}`
    : "guess the lyrics.";

  const ogUrl = (() => {
    if (!artist && !title) return env.NEXT_PUBLIC_DOMAIN + "/og-image.png";
    const ogUrl = new URL(env.NEXT_PUBLIC_DOMAIN + "/og/song");
    if (artist) {
      ogUrl.searchParams.append("artist", artist);
    }
    if (title) {
      ogUrl.searchParams.append("song", title);
    }
    if (coverPhotoUrl) {
      ogUrl.searchParams.append("image_url", coverPhotoUrl);
    }
    return ogUrl.toString();
  })();

  return (
    <>
      <meta name="description" content={pageTitle} />
      <link rel="icon" href="/favicon.ico" />
      <meta
        name="keywords"
        content="guess the lyrics, guess, lyrics, game, music, songs, lyrics game, swiftie"
      />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={pageTitle} />
      <meta
        property="og:description"
        content="Are you a real fan? Try to guess the lyrics of your favorite songs now! Challenge your friends and see who's the real one!"
      />
      <meta property="og:image" content={ogUrl} />
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
