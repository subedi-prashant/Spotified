import type { HTMLAttributes } from "react";

import { Cn } from "@/lib/utils";

export function Separator({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="separator"
      className={Cn("h-px w-full border-t border-dashed border-foreground/45", className)}
      {...props}
    />
  );
}
