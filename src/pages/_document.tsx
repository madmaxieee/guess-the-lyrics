import { Html, Head, Main, NextScript } from "next/document";

import { env } from "@/env.mjs";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <script
          async
          src={env.NEXT_PUBLIC_ADSENSE_SCRIPT_URL}
          crossOrigin="anonymous"
        ></script>
        <NextScript />
      </body>
    </Html>
  );
}
