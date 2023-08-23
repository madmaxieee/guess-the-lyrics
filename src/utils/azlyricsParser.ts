import { JSDOM } from "jsdom";

import { url2path } from "./client";
import { userAgent } from "./userAgent";

export type SongData = {
  path: string;
  title: string;
  artist: string;
  lyrics: string;
  album: string | null;
  coverPhotoURL: string | null;
};

export async function fetchSongData(url: string): Promise<SongData> {
  if (
    !/^https:\/\/www\.azlyrics\.com\/lyrics\/([a-z0-9]+\/[a-z0-9]+)\.html$/.test(
      url
    )
  ) {
    throw new Error(`Invalid URL: ${url}`);
  }

  const response = await fetch(url, {
    headers: { "User-Agent": userAgent() },
  });
  const html = await response.text();

  try {
    const songData = parseAZ(html);
    return {
      ...songData,
      path: url2path(url),
    };
  } catch (e) {
    console.error(e);
    throw Error(
      `Failed to parse AZLyrics page: ${url}, this song may not exist`
    );
  }
}

function parseAZ(html: string): Omit<SongData, "id" | "path"> {
  const document = new JSDOM(html).window.document;

  // normal lyrics page only has one h1
  if (document.querySelectorAll("h1").length > 1) {
    throw new Error("Multiple h1 elements found");
  }

  const h1 = document.querySelector("h1");
  const title =
    h1?.textContent
      ?.trim?.()
      ?.replaceAll('"', "")
      ?.replace(/ lyrics$/, "") ?? "";

  const artistElement = document.querySelector("h2>a>b");
  const artist = artistElement?.textContent?.replace?.(/ Lyrics$/, "") ?? "";

  // select all div with no class
  const divs = document.querySelectorAll("div:not([class]):not([id])");
  // find the longest div's text
  const lyricsDiv = Array.from(divs).reduce((prev, curr) => {
    if ((curr.textContent ?? "").length > (prev.textContent ?? "").length) {
      return curr;
    } else {
      return prev;
    }
  });
  const lyrics = lyricsDiv.textContent?.trim?.() ?? "";

  const albumElement = document.querySelector(".songinalbum_title");
  if (albumElement) {
    const album =
      albumElement.querySelector("b")?.textContent?.replaceAll('"', "") ?? "";
    const coverPhotoSrc =
      albumElement.querySelector(".album-image")?.getAttribute("src") ??
      undefined;
    const coverPhoto = coverPhotoSrc
      ? `https://www.azlyrics.com${coverPhotoSrc}`
      : undefined;
    return {
      title,
      artist,
      album,
      coverPhotoURL: coverPhoto ?? null,
      lyrics,
    };
  } else {
    return {
      title,
      artist,
      lyrics,
      album: null,
      coverPhotoURL: null,
    };
  }
}
