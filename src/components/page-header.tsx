import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <>
      <header className="flex flex-col gap-6 border-b border-border/70 pb-8 sm:flex-row sm:items-end sm:justify-between redesign:hidden">
        <div className="max-w-2xl space-y-4">
          <Badge variant="outline">{eyebrow}</Badge>
          <div className="space-y-2">
            <h1 className="text-balance text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              {title}
            </h1>
            <p className="max-w-xl text-pretty text-sm leading-6 text-muted-foreground sm:text-base">
              {description}
            </p>
          </div>
        </div>
        {action}
      </header>
      <header className="hidden gap-6 border-b-2 border-foreground pb-7 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end redesign:grid">
        <div className="max-w-3xl">
          <h1 className="press-quote text-balance font-display text-[clamp(2.8rem,7vw,5.8rem)] font-black uppercase leading-[0.82] tracking-[-0.03em]">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-sm leading-6 text-muted-foreground sm:text-base">
            {description}
          </p>
          <p className="press-label mt-5 flex items-center gap-2 text-muted-foreground">
            <span className="size-2 bg-primary" aria-hidden="true" />
            {eyebrow}
          </p>
        </div>
        {action ? <div className="sm:justify-self-end">{action}</div> : null}
      </header>
    </>
  );
}
