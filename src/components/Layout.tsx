import { type ReactNode } from "react";

import Footer from "./Footer";
import Header from "./Header";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex grow flex-col items-center">
        <Header />
        {children}
      </main>
      <Footer />
    </div>
  );
}
