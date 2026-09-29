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
    <div className="flex min-h-52 flex-col items-center justify-center border border-dashed border-foreground bg-card px-6 py-10 text-center">
      <span className="grid size-11 place-items-center border border-foreground bg-primary text-primary-foreground">
        <CircleDashed className="size-5" aria-hidden="true" />
      </span>
      <div className="mt-5 max-w-md">
        <h3 className="font-display text-xl font-bold uppercase leading-none">{title}</h3>
        <p className="mt-3 text-xs leading-5 text-muted-foreground sm:text-sm">{description}</p>
      </div>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
