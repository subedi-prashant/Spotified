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
    <div className="flex items-end justify-between gap-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-[-0.02em] sm:text-xl">{title}</h2>
        {description ? (
          <p className="text-xs leading-5 text-muted-foreground sm:text-sm">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
