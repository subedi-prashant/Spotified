import type { InputHTMLAttributes } from "react";

import { Cn } from "@/lib/utils";

export function Input({
  className,
  type = "text",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      className={Cn(
        "h-12 w-full rounded-full border border-input bg-background/60 px-5 text-sm text-foreground shadow-inner outline-none transition placeholder:text-muted-foreground/70 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50 redesign:rounded-[1px] redesign:bg-background redesign:px-4 redesign:shadow-none redesign:placeholder:text-muted-foreground redesign:focus:border-primary redesign:focus:ring-3 redesign:focus:ring-primary/25",
        className,
      )}
      {...props}
    />
  );
}
