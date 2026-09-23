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
    <main className="min-h-svh px-5 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <header className="flex items-center justify-between border-b border-border pb-7">
          <Link href="/" aria-label="Music Atlas home">
            <BrandMark />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Home
          </Link>
        </header>
        <article className="py-12">
          <div className="border-b border-border pb-9">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-violet-300">
              Owner review required before deployment
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">{title}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              {description}
            </p>
            <p className="mt-4 text-xs text-muted-foreground">Effective 23 September 2026</p>
          </div>
          <div className="prose-atlas space-y-9 py-9 text-sm leading-7 text-muted-foreground">
            {children}
          </div>
        </article>
      </div>
    </main>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold tracking-[-0.025em] text-foreground">{title}</h2>
      {children}
    </section>
  );
}
