import { JSDOM } from "jsdom";
import { userAgent } from "./userAgent";

type SongData = {
  title: string;
  artist: string;
  album?: string;
  coverPhoto?: string;
  lyrics: string;
};

export async function getSongData(url: string) {
  if (!/https:\/\/www\.azlyrics\.com\/lyrics\/[a-z]+\/[a-z]+\.html/.test(url)) {
    throw new Error("Invalid azlyrics url");
  }

  const response = await fetch(url, {
    headers: { "User-Agent": userAgent() },
  });
  const html = await response.text();
  return parseAZ(html);
}

function parseAZ(html: string): SongData {
  const document = new JSDOM(html).window.document;

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
      coverPhoto,
      lyrics,
    };
  } else {
    return {
      title,
      artist,
      lyrics,
    };
  }
}
