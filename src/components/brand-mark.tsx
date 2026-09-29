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
      <span className="press-tag-swing grid size-10 place-items-center rounded-[0.9rem] bg-gradient-to-br from-violet-400 via-fuchsia-400 to-orange-300 text-neutral-950 shadow-[0_12px_30px_-12px_rgba(217,70,239,0.8)] redesign:size-11 redesign:rounded-none redesign:border redesign:border-foreground redesign:bg-primary redesign:bg-none redesign:text-primary-foreground redesign:shadow-none">
        <AudioLines className="size-5" strokeWidth={2.4} aria-hidden="true" />
      </span>
      {!compact ? (
        <span className="leading-none">
          <span className="block text-sm font-bold tracking-[-0.02em] text-foreground redesign:font-display redesign:text-lg redesign:font-black redesign:uppercase redesign:tracking-[0.03em]">
            Spotified
          </span>
          <span className="mt-1 hidden text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground redesign:block">
            Private audio system
          </span>
        </span>
      ) : null}
    </span>
  );
}
