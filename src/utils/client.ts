export function url2id(url: string): string {
  const match = url.match(
    /https:\/\/www\.azlyrics\.com\/lyrics\/([a-z0-9]+\/[a-z0-9]+)\.html/
  );
  if (match) {
    return match[1]!;
  } else {
    throw new Error(`Invalid URL: ${url}`);
  }
}
