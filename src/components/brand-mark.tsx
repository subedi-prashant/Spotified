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
      <span className="grid size-10 place-items-center rounded-[0.9rem] bg-gradient-to-br from-violet-400 via-fuchsia-400 to-orange-300 text-neutral-950 shadow-[0_12px_30px_-12px_rgba(217,70,239,0.8)]">
        <AudioLines className="size-5" strokeWidth={2.3} aria-hidden="true" />
      </span>
      {!compact ? (
        <span className="text-sm font-bold tracking-[-0.02em] text-foreground">Music Atlas</span>
      ) : null}
    </span>
  );
}
