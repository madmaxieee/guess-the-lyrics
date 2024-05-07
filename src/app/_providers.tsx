"use client";

import type { ReactNode } from "react";

import { ThemeProvider as NextThemesProvider } from "next-themes";

import { TRPCReactProvider } from "@/trpc/react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <TRPCReactProvider>
      <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem>
        {children}
      </NextThemesProvider>
    </TRPCReactProvider>
  );
}
