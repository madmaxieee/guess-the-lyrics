import "../global.css";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type AppType } from "next/app";

import "@/styles/globals.css";
import { api } from "@/utils/api";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem>
      <Component {...pageProps} />
    </NextThemesProvider>
  );
};

export default api.withTRPC(MyApp);
