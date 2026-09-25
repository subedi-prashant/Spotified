import type { HTMLAttributes } from "react";

import { Cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={Cn("animate-pulse rounded-none bg-muted", className)} {...props} />;
}
