import type { ReactNode } from "react";

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
    <header className="grid gap-6 border-b-2 border-foreground pb-7 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
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
  );
}
