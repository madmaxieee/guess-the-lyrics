import { JSDOM } from "jsdom";
import { userAgent } from "./userAgent";

type SongData = {
  title: string;
  artist: string;
  album: string;
  lyrics: string;
};

export async function getLyrics(url: string) {
  const response = await fetch(url, {
    headers: { "User-Agent": userAgent() },
  });
  const html = await response.text();
  return parseAZ(html);
}

function parseAZ(html: string): SongData {
  const document = new JSDOM(html).window.document;

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

  return {
    title: "",
    artist: "",
    album: "",
    lyrics,
  };
}
