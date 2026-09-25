import type { ReactNode } from "react";

export function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4 border-t border-foreground pt-3">
      <div>
        <h2 className="press-quote font-display text-2xl font-black uppercase leading-none tracking-[0.01em] sm:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 max-w-2xl text-xs leading-5 text-muted-foreground sm:text-sm">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
