import { Html, Head, Main, NextScript } from "next/document";

// import Script from "next/script";
// import { env } from "@/env.mjs";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        {/* <Script */}
        {/*   id="adsense-id" */}
        {/*   async */}
        {/*   strategy="afterInteractive" */}
        {/*   src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${env.NEXT_PUBLIC_ADSENSE_ID}`} */}
        {/*   crossOrigin="anonymous" */}
        {/* /> */}
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
