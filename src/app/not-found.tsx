import Link from "next/link";
import { Map } from "lucide-react";

import { BrandMark } from "@/components/brand-mark";
import { ButtonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-svh place-items-center px-5 py-10">
      <div className="w-full max-w-2xl border border-foreground bg-card">
        <div className="flex items-center justify-between border-b border-foreground p-5">
          <BrandMark />
          <span className="press-label text-muted-foreground">ERR / 404</span>
        </div>
        <div className="grid gap-7 p-7 sm:grid-cols-[5rem_1fr] sm:p-10">
          <span className="grid size-20 place-items-center border border-foreground bg-primary">
            <Map className="size-8" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-balance font-display text-5xl font-black uppercase leading-[0.82] tracking-[-0.03em] sm:text-6xl">
              This view is off the map
            </h1>
            <p className="mt-5 text-sm leading-6 text-muted-foreground">
              The page may have moved, or the address is incomplete.
            </p>
            <Link href="/" className={`${ButtonVariants()} mt-7`}>
              Return home
            </Link>
          </div>
        </div>
        <div className="press-stripes h-9 border-t border-foreground" aria-hidden="true" />
      </div>
    </main>
  );
}
