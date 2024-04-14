import { JSDOM } from "jsdom";

import { env } from "@/env";
import { songurl2path } from "@/utils/client";

import { BlockExternalResourceLoader } from "./resourceLoader";
import { fetchScrape, proxyScrape } from "./scrapers";

export type SongData = {
  path: string;
  title: string;
  artist: string;
  lyrics: string;
  album: string | null;
  coverPhotoURL: string | null;
};

const scrape = env.NODE_ENV === "production" ? proxyScrape : fetchScrape;

export async function fetchSongData(url: string): Promise<SongData> {
  if (
    !/^https:\/\/www\.azlyrics\.com\/lyrics\/([a-z0-9\-]+\/[a-z0-9\-]+)\.html$/.test(
      url
    )
  ) {
    throw new Error(`Invalid URL: ${url}`);
  }

  const html = await scrape(url);

  try {
    const songData = parseLyricsPage(html);
    return {
      ...songData,
      path: songurl2path(url),
    };
  } catch (e) {
    console.error(e);
    throw Error(
      `Failed to parse AZLyrics page: ${url}, this song may not exist`
    );
  }
}

function parseLyricsPage(html: string): Omit<SongData, "id" | "path"> {
  const document = new JSDOM(html, {
    resources: new BlockExternalResourceLoader(),
  }).window.document;

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

  const artistElement = document.querySelector("h2 b");
  const artist = artistElement?.textContent?.replace?.(/ Lyrics$/, "") ?? "";

  // select all div with no class
  const divs = document.querySelectorAll("div:not([class]):not([id])");
  if (divs.length === 0) {
    console.error(html);
    throw new Error("No divs found");
  }

  // find the longest div's text
  const lyricsDiv = Array.from(divs).reduce((prev, curr) => {
    if ((curr.textContent ?? "").length > (prev.textContent ?? "").length) {
      return curr;
    } else {
      return prev;
    }
  });
  const lyrics = (lyricsDiv.textContent ?? "").replaceAll(/\[.*\]/g, "").trim();

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

export async function fetchArtistData(url: string) {
  if (
    !/https:\/\/www\.azlyrics\.com\/([a-z]|19)\/([a-z0-9\-]+)\.html/.test(url)
  ) {
    throw new Error(`Invalid URL: ${url}`);
  }

  const html = await scrape(url);

  try {
    const artistData = parseArtistPage(html);
    return artistData;
  } catch (e) {
    console.error(e);
    throw Error(
      `Failed to parse AZLyrics page: ${url}, this song may not exist`
    );
  }
}

export type ArtistData = {
  name: string;
  albums: Array<{
    name: string;
    coverPhotoURL?: string;
    songs: Array<{
      title: string;
      path: string;
    }>;
  }>;
  otherSongs?: Array<{
    title: string;
    path: string;
  }>;
};

function parseArtistPage(html: string): ArtistData {
  const artistData: ArtistData = {
    name: "",
    albums: [],
  };

  const document = new JSDOM(html, {
    resources: new BlockExternalResourceLoader(),
  }).window.document;
  const artistName = (document.querySelector("h1>strong")?.textContent ?? "")
    .replace(/\s*lyrics\s*$/i, "")
    .trim();

  artistData.name = artistName;

  const albumListElement = document.querySelector("#listAlbum");
  if (!albumListElement) {
    throw new Error("Failed to find album list");
  }

  let currentAlbum: ArtistData["albums"][number] = {
    name: "",
    songs: [],
  };
  for (const div of albumListElement.querySelectorAll(
    "div.listalbum-item,div.album"
  )) {
    if (div.classList.contains("album")) {
      if (currentAlbum.name !== "") {
        artistData.albums.push(currentAlbum);
      }

      const albumName = (div.querySelector("b")?.textContent ?? "")
        .replace(/^"(.+)"$/, "$1")
        .replace(/:$/, "")
        .trim();
      currentAlbum = {
        name: albumName,
        songs: [],
      };

      const albumCoverPhotoPath = div.querySelector("img")?.src;
      if (albumCoverPhotoPath) {
        currentAlbum.coverPhotoURL = `https://www.azlyrics.com${albumCoverPhotoPath}`;
      }
    } else {
      const anchor = div.querySelector("a");
      if (!anchor) continue;

      const songTitle = anchor.textContent?.trim() ?? "";
      const songPath = (anchor.getAttribute("href")?.trim() ?? "").match(
        /\/lyrics\/([a-z0-9\-]+\/[a-z0-9\-]+)\.html/
      )?.[1];

      if (!songPath) continue;

      currentAlbum.songs.push({
        title: songTitle,
        path: songPath,
      });
    }
  }
  if (currentAlbum.name === "other songs") {
    artistData.otherSongs = currentAlbum.songs;
  } else {
    artistData.albums.push(currentAlbum);
  }

  return artistData;
}
