import Link from "next/link";
import { Map } from "lucide-react";

import { BrandMark } from "@/components/brand-mark";
import { ButtonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-svh place-items-center px-5">
      <div className="flex max-w-md flex-col items-center gap-6 text-center">
        <BrandMark />
        <span className="grid size-16 place-items-center rounded-3xl bg-secondary text-muted-foreground">
          <Map className="size-7" aria-hidden="true" />
        </span>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-[-0.04em]">This view is off the map</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            The page may have moved, or the address is incomplete.
          </p>
        </div>
        <Link href="/" className={ButtonVariants()}>
          Return home
        </Link>
      </div>
    </main>
  );
}
