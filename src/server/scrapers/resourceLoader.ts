import { ResourceLoader } from "jsdom";
import type { FetchOptions, AbortablePromise } from "jsdom";

export class BlockExternalResourceLoader extends ResourceLoader {
  fetch(_url: string, _options: FetchOptions): AbortablePromise<Buffer> | null {
    return null;
  }
}
