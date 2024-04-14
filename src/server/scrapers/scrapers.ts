import { HttpsProxyAgent } from "https-proxy-agent";
import fetch from "node-fetch";
import puppeteer, { type Browser } from "puppeteer-core";

import { env } from "@/env";

import { userAgent } from "./userAgent";

export async function puppeteerScrape(url: string) {
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

export async function fetchScrape(url: string) {
  const response = await fetch(url, {
    headers: { "User-Agent": userAgent() },
  });
  return await response.text();
}

const proxyAgent = new HttpsProxyAgent(env.PROXY_URL);
export async function proxyScrape(url: string) {
  const response = await fetch(url, {
    headers: { "User-Agent": userAgent() },
    agent: proxyAgent,
  });
  return await response.text();
}
