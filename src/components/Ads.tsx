import Script from "next/script";

import { env } from "@/env.mjs";

export function InArticleAd() {
  return (
    <>
      <ins
        className="adsbygoogle"
        style={{ display: "block", textAlign: "center" }}
        data-ad-layout="in-article"
        data-ad-format="fluid"
        data-ad-client={env.NEXT_PUBLIC_ADSENSE_ID}
        data-ad-slot="7422752571"
      ></ins>
      <Script
        id="adsense-id"
        dangerouslySetInnerHTML={{
          __html: "(adsbygoogle = window.adsbygoogle || []).push({});",
        }}
      />
    </>
  );
}

export function FooterAd() {
  return (
    <>
      <ins
        className="adsbygoogle"
        style={{ display: "block", margin: "0 auto" }}
        data-ad-client={env.NEXT_PUBLIC_ADSENSE_ID}
        data-ad-slot="8547846577"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
      <Script
        id="adsense-id"
        dangerouslySetInnerHTML={{
          __html: "(adsbygoogle = window.adsbygoogle || []).push({});",
        }}
      />
    </>
  );
}
