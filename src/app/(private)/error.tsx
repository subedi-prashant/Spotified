"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function PrivateError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    void error.digest;
  }, [error]);

  return (
    <section className="mx-auto mt-20 max-w-2xl border border-foreground bg-card">
      <div className="press-stripes h-8 border-b border-foreground" aria-hidden="true" />
      <div className="grid gap-6 p-8 text-center sm:grid-cols-[3.5rem_1fr] sm:text-left">
        <span className="mx-auto grid size-14 place-items-center border border-foreground bg-destructive text-white">
          <AlertCircle className="size-6" aria-hidden="true" />
        </span>
        <div>
          <h1 className="font-display text-3xl font-bold uppercase leading-none">
            This view could not be loaded
          </h1>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            No partial account data was displayed. You can safely try the request again.
          </p>
          <Button onClick={reset} className="mt-6">
            Try again
          </Button>
        </div>
      </div>
    </section>
  );
}
