"use client";

import type { ReactNode } from "react";

import "../global.css";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Roboto_Mono } from "next/font/google";

import { Analytics } from "@vercel/analytics/react";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/toaster";
import { TRPCReactProvider } from "@/trpc/react";
import { cn } from "@/utils/ui";

const robotoMono = Roboto_Mono({
  weight: ["500"],
  variable: "--font-roboto-mono",
  subsets: ["latin-ext"],
  preload: true,
});

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <TRPCReactProvider>
        <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem>
          <body
            className={cn("flex min-h-screen flex-col", robotoMono.variable)}
          >
            <main className="flex grow flex-col items-center">
              <Header />
              {children}
            </main>
            <Footer />
          </body>
          <Toaster />
        </NextThemesProvider>
      </TRPCReactProvider>
      <Analytics />
    </html>
  );
}
