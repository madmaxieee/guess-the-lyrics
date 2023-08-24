import { JSDOM } from "jsdom";

import { fetchScrape } from "./scrapers";

type DuckDuckGoResultItem = {
  title: string;
  url: string;
  description: string;
};

export async function search(query: string) {
  const cleanedQuery = query.trim().replaceAll(/\s/g, "+");
  const url = `https://lite.duckduckgo.com/lite/?q=${cleanedQuery}`;
  const html = await fetchScrape(url);
  return new DuckDuckGoResult(url, html);
}

class DuckDuckGoResult {
  private _url: string;
  private _html: string;
  private _items: DuckDuckGoResultItem[] = [];

  public constructor(url: string, response: string) {
    this._url = url;
    this._html = response;
  }

  public text() {
    return this._html;
  }

  public url() {
    return this._url;
  }

  public first(): DuckDuckGoResultItem {
    if (this._items.length === 0) {
      this._parse();
    }

    const firstItem = this._items[0];
    if (firstItem) {
      return firstItem;
    } else {
      throw new Error("No results");
    }
  }

  public items(): DuckDuckGoResultItem[] {
    if (this._items.length === 0) {
      this._parse();
    }
    return this._items;
  }

  private _parse() {
    const document = new JSDOM(this._html).window.document;

    const tables = document.querySelectorAll("table");
    console.log(this._html);
    // find the longest table
    const resultsTable = Array.from(tables).reduce((prev, curr) => {
      if (curr.rows.length > prev.rows.length) {
        return curr;
      } else {
        return prev;
      }
    });

    const currentItem: DuckDuckGoResultItem = {
      title: "",
      url: "",
      description: "",
    };

    // last row is next page
    Array.from(resultsTable.rows)
      .slice(0, -1)
      .forEach((row, i) => {
        switch (i % 4) {
          case 0:
            // title
            const resultLinkElement = row.querySelector("a");
            currentItem.title = resultLinkElement?.textContent ?? "";

            currentItem.url = resultLinkElement?.href ?? "";
            currentItem.url = currentItem.url.match(/https[^&]+/)?.[0] ?? "";
            currentItem.url = decodeURIComponent(currentItem.url);

            currentItem.description = "";
            break;

          case 1:
            // description
            currentItem.description = (row.textContent ?? "").trim();
            break;

          case 2:
            // url text
            break;

          case 3:
            if (currentItem.title !== "" && currentItem.url !== "") {
              this._items.push({ ...currentItem });
            }
            // blank
            break;
        }
      });
  }
}
