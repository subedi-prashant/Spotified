import type { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { Cn } from "@/lib/utils";

export const ButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[2px] border font-display text-sm font-bold uppercase tracking-[0.08em] transition-[background-color,color,border-color,transform] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-3 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-45 active:translate-y-px",
  {
    variants: {
      variant: {
        default:
          "border-foreground bg-primary px-5 py-2.5 text-primary-foreground hover:bg-foreground hover:text-background",
        secondary:
          "border-foreground bg-secondary px-5 py-2.5 text-secondary-foreground hover:bg-primary hover:text-primary-foreground",
        outline:
          "border-foreground bg-background px-5 py-2.5 text-foreground hover:bg-foreground hover:text-background",
        ghost:
          "border-transparent px-4 py-2 text-muted-foreground hover:border-foreground hover:bg-background hover:text-foreground",
        destructive: "border-foreground bg-destructive px-5 py-2.5 text-white hover:bg-foreground",
      },
      size: {
        default: "h-11",
        sm: "h-9 px-3 py-2 text-xs",
        lg: "h-14 px-7 text-base",
        icon: "size-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof ButtonVariants>;

export function Button({ className, variant, size, type = "button", ...props }: ButtonProps) {
  return (
    <button type={type} className={Cn(ButtonVariants({ variant, size }), className)} {...props} />
  );
}
