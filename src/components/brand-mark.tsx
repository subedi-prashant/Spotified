import { AudioLines } from "lucide-react";

import { Cn } from "@/lib/utils";

export function BrandMark({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <span className={Cn("inline-flex items-center gap-3", className)}>
      <span className="press-tag-swing grid size-11 place-items-center border border-foreground bg-primary text-primary-foreground">
        <AudioLines className="size-5" strokeWidth={2.4} aria-hidden="true" />
      </span>
      {!compact ? (
        <span className="leading-none">
          <span className="block font-display text-lg font-black uppercase tracking-[0.03em] text-foreground">
            Spotified
          </span>
          <span className="mt-1 block text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Private audio system
          </span>
        </span>
      ) : null}
    </span>
  );
}
