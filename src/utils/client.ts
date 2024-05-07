export function songurl2path(url: string): string {
  const match = url.match(
    /https:\/\/www\.azlyrics\.com\/lyrics\/([a-z0-9\-]+\/[a-z0-9\-]+)\.html/
  );
  if (match) {
    return match[1]!;
  }

  throw new Error(`Invalid URL: ${url}`);
}

export function songpath2url(path: string): string {
  if (!/^[a-z0-9\-]+\/[a-z0-9\-]+$/.test(path)) {
    throw new Error(`Invalid path: ${path}`);
  }
  return `https://www.azlyrics.com/lyrics/${path}.html`;
}

export function artisturl2key(url: string) {
  const match = url.match(
    /https:\/\/www\.azlyrics\.com\/([a-z]|19)\/([a-z0-9\-]+)\.html/
  );
  if (match) {
    return match[2]!;
  }

  throw new Error(`Invalid URL: ${url}`);
}

export function artistkey2url(key: string) {
  if (!/^[a-z0-9\-]+$/.test(key)) {
    throw new Error(`Invalid path: ${key}`);
  }
  let prefix = key[0]!;
  if (prefix.match(/[0-9]/)) {
    prefix = "19";
  }
  return `https://www.azlyrics.com/${prefix}/${key}.html`;
}
