import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button, ButtonVariants } from "@/components/ui/button";
import type { SpotifyPageError } from "@/lib/spotify/errors";

export function ProviderError({ error }: { error: SpotifyPageError }) {
  return (
    <section className="mx-auto max-w-2xl border border-foreground bg-card" role="alert">
      <div className="press-stripes h-7 border-b border-foreground" aria-hidden="true" />
      <div className="flex flex-col items-center gap-5 p-8 text-center">
        <span className="grid size-12 place-items-center border border-foreground bg-primary">
          <AlertTriangle className="size-6" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-display text-3xl font-bold uppercase leading-none">{error.title}</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{error.description}</p>
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
      </div>
    </section>
  );
}
