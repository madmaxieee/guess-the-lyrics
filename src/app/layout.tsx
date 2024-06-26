"use client";

import type { ReactNode } from "react";

import "../global.css";
import { Roboto_Mono } from "next/font/google";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/utils/ui";

import Providers from "./_providers";

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
    <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
      <body className={cn("flex min-h-screen flex-col", robotoMono.variable)}>
        <Providers>
          <main className="flex grow flex-col items-center">
            <Header />
            {children}
          </main>
          <Footer />
          <Toaster />
          <Analytics />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
}
