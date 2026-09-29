import type { HTMLAttributes } from "react";

import { Cn } from "@/lib/utils";

export function Separator({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="separator"
      className={Cn(
        "h-px w-full bg-border redesign:border-t redesign:border-dashed redesign:border-foreground/45 redesign:bg-transparent",
        className,
      )}
      {...props}
    />
  );
}
