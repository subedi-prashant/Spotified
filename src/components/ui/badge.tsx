import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { Cn } from "@/lib/utils";

const BadgeVariants = cva(
  "inline-flex w-fit items-center gap-1.5 rounded-[1px] border px-2.5 py-1 font-display text-[0.68rem] font-bold uppercase tracking-[0.14em]",
  {
    variants: {
      variant: {
        default: "border-foreground bg-primary text-primary-foreground",
        secondary: "border-foreground bg-secondary text-secondary-foreground",
        outline: "border-foreground bg-transparent text-foreground",
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
