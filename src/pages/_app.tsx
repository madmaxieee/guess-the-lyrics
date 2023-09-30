import "../global.css";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type AppType } from "next/app";
import { Roboto_Mono } from "next/font/google";

import { Analytics } from "@vercel/analytics/react";

import { api } from "@/utils/api";

const robotoMono = Roboto_Mono({
  weight: ["500"],
  variable: "--font-roboto-mono",
  subsets: ["latin-ext"],
  preload: true,
});

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem>
        <div className={robotoMono.variable}>
          <Component {...pageProps} />
        </div>
      </NextThemesProvider>
      <Analytics />
    </>
  );
};

export default api.withTRPC(MyApp);
