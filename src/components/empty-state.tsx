import type { ReactNode } from "react";
import { CircleDashed } from "lucide-react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-4 rounded-[1.5rem] border border-dashed border-border bg-card/30 px-6 text-center">
      <span className="grid size-11 place-items-center rounded-2xl bg-secondary text-muted-foreground">
        <CircleDashed className="size-5" aria-hidden="true" />
      </span>
      <div className="max-w-md space-y-1.5">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-xs leading-5 text-muted-foreground sm:text-sm">{description}</p>
      </div>
      {action}
    </div>
  );
}
