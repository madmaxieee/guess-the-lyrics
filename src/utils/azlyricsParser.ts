import { HttpsProxyAgent } from "https-proxy-agent";
import { JSDOM } from "jsdom";
import fetch from "node-fetch";
import puppeteer, { type Browser } from "puppeteer-core";

import { env } from "@/env.mjs";

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

const scrape = env.NODE_ENV === "production" ? proxyScrape : fetchScrape;

export async function fetchSongData(url: string): Promise<SongData> {
  if (
    !/^https:\/\/www\.azlyrics\.com\/lyrics\/([a-z0-9]+\/[a-z0-9]+)\.html$/.test(
      url
    )
  ) {
    throw new Error(`Invalid URL: ${url}`);
  }

  const html = await scrape(url);

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function puppeteerScrape(url: string) {
  let browser: Browser | null = null;
  try {
    browser = await puppeteer.connect({
      browserWSEndpoint: env.BROWSERLESS_URL,
    });
    const page = await browser.newPage();
    await page.goto(url);
    return await page.content();
  } catch (e) {
    console.error(e);
    throw new Error(`Failed to scrape ${url}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function fetchScrape(url: string) {
  const response = await fetch(url, {
    headers: { "User-Agent": userAgent() },
  });
  return await response.text();
}

const proxyAgent = new HttpsProxyAgent(env.PROXY_URL);
async function proxyScrape(url: string) {
  const response = await fetch(url, {
    headers: { "User-Agent": userAgent() },
    agent: proxyAgent,
  });
  return await response.text();
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
