import type { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { Cn } from "@/lib/utils";

export const ButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-[background-color,color,border-color,box-shadow,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:translate-y-px",
  {
    variants: {
      variant: {
        default:
          "bg-primary px-5 py-2.5 text-primary-foreground shadow-[0_12px_36px_-14px_var(--primary)] hover:bg-primary/90",
        secondary: "bg-secondary px-5 py-2.5 text-secondary-foreground hover:bg-secondary/80",
        outline:
          "border border-border bg-background/40 px-5 py-2.5 text-foreground backdrop-blur hover:border-foreground/30 hover:bg-accent",
        ghost: "px-4 py-2 text-muted-foreground hover:bg-accent hover:text-foreground",
        destructive:
          "bg-destructive px-5 py-2.5 text-white shadow-[0_12px_36px_-14px_var(--destructive)] hover:bg-destructive/90",
      },
      size: {
        default: "h-11",
        sm: "h-9 px-4 py-2 text-xs",
        lg: "h-13 px-7 text-base",
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
