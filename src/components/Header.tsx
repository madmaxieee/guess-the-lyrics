import Link from "next/link";

import { Separator } from "./ui/separator";

export default function Header() {
  return (
    <>
      <div className="container flex flex-col items-start justify-between space-y-2 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16">
        <Link href="/">
          <h2 className="text-lg font-semibold">guess the lyrics</h2>
        </Link>
      </div>
      <Separator />
    </>
  );
}
