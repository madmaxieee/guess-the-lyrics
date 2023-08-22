export function url2path(url: string): string {
  const match = url.match(
    /https:\/\/www\.azlyrics\.com\/lyrics\/([a-z0-9]+\/[a-z0-9]+)\.html/
  );
  if (match) {
    return match[1]!;
  } else {
    throw new Error(`Invalid URL: ${url}`);
  }
}

export function splitOnce(s: string, re: RegExp) {
  const match = s.match(re);
  if (!match) {
    return [s];
  }
  const index = match.index ?? s.length;
  return [s.slice(0, index), s.slice(index + match[0].length)];
}
