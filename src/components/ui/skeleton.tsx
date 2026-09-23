import type { HTMLAttributes } from "react";

import { Cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={Cn("animate-pulse rounded-xl bg-muted", className)} {...props} />;
}
