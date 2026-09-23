"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
    <Card className="mx-auto mt-20 max-w-lg">
      <CardContent className="flex flex-col items-center gap-5 p-9 text-center">
        <span className="grid size-12 place-items-center rounded-2xl bg-destructive/10 text-red-300">
          <AlertCircle className="size-6" aria-hidden="true" />
        </span>
        <div className="space-y-2">
          <h1 className="text-xl font-semibold">This view could not be loaded</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            No partial account data was displayed. You can safely try the request again.
          </p>
        </div>
        <Button onClick={reset}>Try again</Button>
      </CardContent>
    </Card>
  );
}
