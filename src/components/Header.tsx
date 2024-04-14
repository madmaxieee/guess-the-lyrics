import Link from "next/link";

import { ShareButton } from "./ShareButton";
import ThemeToggle from "./ThemeToggle";
import { Separator } from "./ui/separator";

export default function Header() {
  return (
    <>
      <div className="container flex h-16 flex-row items-center justify-between space-y-0 py-4">
        <Link href="/">
          <h2 className="text-lg font-semibold">guess the lyrics.</h2>
        </Link>
        <div className="flex gap-2">
          <ShareButton title="guess the lyrics." />
          <ThemeToggle />
        </div>
      </div>
      <Separator />
    </>
  );
}
