import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { Cn } from "@/lib/utils";

const BadgeVariants = cva(
  "inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] redesign:rounded-[1px] redesign:font-display redesign:font-bold redesign:tracking-[0.14em]",
  {
    variants: {
      variant: {
        default:
          "border-primary/20 bg-primary/10 text-primary redesign:border-foreground redesign:bg-primary redesign:text-primary-foreground",
        secondary:
          "border-border bg-secondary text-muted-foreground redesign:border-foreground redesign:text-secondary-foreground",
        outline:
          "border-border bg-transparent text-muted-foreground redesign:border-foreground redesign:text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof BadgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={Cn(BadgeVariants({ variant }), className)} {...props} />;
}
