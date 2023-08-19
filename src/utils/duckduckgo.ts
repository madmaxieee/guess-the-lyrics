import { JSDOM } from "jsdom";

import { userAgent } from "./userAgent";

type DuckDuckGoResultItem = {
  title: string;
  url: string;
  description: string;
};

export async function search(query: string) {
  const cleanedQuery = query.trim().replaceAll(/\s/g, "+");
  const url = `https://lite.duckduckgo.com/lite/?q=${cleanedQuery}&ko=-2&kz=1`;
  const response = await fetch(url, {
    headers: { "User-Agent": userAgent() },
  });
  const text = await response.text();
  return new DuckDuckGoResult(url, text);
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
    this._parse();
    const firstItem = this._items[0];
    if (firstItem) {
      return firstItem;
    } else {
      throw new Error("No results");
    }
  }

  public items(): DuckDuckGoResultItem[] {
    throw new Error("Not implemented Yet");
  }

  private _parse() {
    const document = new JSDOM(this._html).window.document;

    const tables = document.querySelectorAll("table");
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
            currentItem.title = (row.textContent ?? "")
              .replace(/^\s*[0-9]+\./, "")
              .trim();

            currentItem.url = row.querySelector("a")?.href ?? "";
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
