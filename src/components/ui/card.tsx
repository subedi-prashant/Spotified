import type { HTMLAttributes } from "react";

import { Cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={Cn(
        "rounded-[1.5rem] border border-border/80 bg-card/75 text-card-foreground shadow-[0_24px_80px_-44px_rgba(0,0,0,0.9)] backdrop-blur-xl redesign:press-plate redesign:rounded-none redesign:border-foreground redesign:bg-card redesign:shadow-none redesign:backdrop-blur-none",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={Cn(
        "flex flex-col gap-1.5 p-6 redesign:gap-2 redesign:border-b redesign:border-foreground/25 redesign:p-5",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={Cn(
        "text-lg font-semibold tracking-tight redesign:press-quote redesign:font-display redesign:text-xl redesign:font-bold redesign:uppercase redesign:tracking-[0.01em]",
        className,
      )}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={Cn("text-sm leading-6 text-muted-foreground", className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={Cn("p-6 pt-0 redesign:p-5", className)} {...props} />;
}
