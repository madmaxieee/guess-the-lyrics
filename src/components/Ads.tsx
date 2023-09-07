import { useEffect, useState } from "react";

import { env } from "@/env.mjs";

export function InArticleAd() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  return (
    <>
      {isClient && (
        <>
          <ins
            className="adsbygoogle"
            style={{ display: "block", textAlign: "center" }}
            data-ad-layout="in-article"
            data-ad-format="fluid"
            data-ad-client={env.NEXT_PUBLIC_ADSENSE_ID}
            data-ad-slot="7422752571"
          ></ins>
          <script>{`(adsbygoogle = window.adsbygoogle || []).push({});`}</script>
        </>
      )}
    </>
  );
}

export function FooterAd() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  return (
    <>
      {isClient && (
        <>
          <ins
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client={env.NEXT_PUBLIC_ADSENSE_ID}
            data-ad-slot="8547846577"
            data-ad-format="auto"
            data-full-width-responsive="true"
          ></ins>
          <script>{`(adsbygoogle = window.adsbygoogle || []).push({});`}</script>
        </>
      )}
    </>
  );
}
