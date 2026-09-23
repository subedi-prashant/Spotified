import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button, ButtonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { SpotifyPageError } from "@/lib/spotify/errors";

export function ProviderError({ error }: { error: SpotifyPageError }) {
  return (
    <Card className="mx-auto max-w-xl border-amber-400/20 bg-amber-400/5">
      <CardContent className="flex flex-col items-center gap-5 p-8 text-center">
        <span className="grid size-12 place-items-center rounded-2xl bg-amber-400/10 text-amber-300">
          <AlertTriangle className="size-6" aria-hidden="true" />
        </span>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">{error.title}</h2>
          <p className="text-sm leading-6 text-muted-foreground">{error.description}</p>
        </div>
        {error.action === "reconnect" ? (
          <form action="/api/auth/spotify/reconnect" method="post">
            <Button type="submit">Reconnect Spotify</Button>
          </form>
        ) : null}
        {error.action === "retry" ? (
          <a href="" className={ButtonVariants({ variant: "outline" })}>
            <RefreshCw className="size-4" aria-hidden="true" />
            Refresh the page
          </a>
        ) : null}
      </CardContent>
    </Card>
  );
}
