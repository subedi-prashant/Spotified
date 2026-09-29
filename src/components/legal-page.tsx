import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

import { BrandMark } from "@/components/brand-mark";

export function LegalPage({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-svh bg-background">
      <div className="mx-auto grid min-h-svh max-w-[100rem] lg:grid-cols-[15rem_minmax(0,1fr)]">
        <aside className="flex flex-col border-b border-foreground lg:sticky lg:top-0 lg:h-svh lg:border-b-0 lg:border-r">
          <Link href="/" aria-label="Spotified home" className="border-b border-foreground p-5">
            <BrandMark />
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 border-b border-foreground p-4 font-display text-sm font-bold uppercase tracking-[0.06em] hover:bg-primary"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Home
          </Link>
          <div className="hidden flex-1 flex-col lg:flex">
            <div className="p-4">
              <p className="press-label text-muted-foreground">Document control</p>
              <p className="mt-3 text-xs leading-5">Owner review required before deployment.</p>
            </div>
            <div className="mt-auto">
              <div className="press-stripes h-28 border-y border-foreground" aria-hidden="true" />
              <p className="p-4 text-[0.68rem] text-muted-foreground">
                Effective 23 September 2026
              </p>
            </div>
          </div>
        </aside>

        <article className="px-5 py-10 sm:px-8 sm:py-14 lg:px-12 xl:px-16">
          <header className="border-b-2 border-foreground pb-9">
            <h1 className="max-w-4xl text-balance font-display text-[clamp(3.5rem,8vw,6rem)] font-black uppercase leading-[0.8] tracking-[-0.03em]">
              {title}
            </h1>
            <p className="mt-6 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
              {description}
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              <span>Owner review required</span>
              <span>Effective 23 September 2026</span>
            </div>
          </header>
          <div className="py-4 text-sm leading-7 text-muted-foreground">{children}</div>
        </article>
      </div>
    </main>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-foreground/45 py-8 first:border-t-0 sm:grid-cols-[13rem_minmax(0,1fr)] sm:gap-8">
      <h2 className="font-display text-2xl font-bold uppercase leading-none text-foreground">
        {title}
      </h2>
      <div className="max-w-[75ch] space-y-4">{children}</div>
    </section>
  );
}
