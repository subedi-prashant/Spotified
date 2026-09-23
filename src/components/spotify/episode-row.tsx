import { ExternalLink, Podcast } from "lucide-react";

import { FormatDuration } from "@/lib/spotify/format";
import type { SpotifyPlayableItem } from "@/lib/spotify/schemas";

export function EpisodeRow({
  episode,
}: {
  episode: Extract<SpotifyPlayableItem, { type: "episode" }>;
}) {
  const body = (
    <>
      <span className="grid size-11 shrink-0 place-items-center rounded-lg border border-white/8 bg-violet-500/10 text-violet-200">
        <Podcast className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-foreground">{episode.name}</span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">Podcast episode</span>
      </span>
      <span className="hidden text-xs text-muted-foreground sm:block">
        {FormatDuration(episode.duration_ms)}
      </span>
      {episode.external_urls.spotify ? (
        <ExternalLink className="size-3.5 text-muted-foreground" />
      ) : null}
    </>
  );

  if (episode.external_urls.spotify) {
    return (
      <a
        href={episode.external_urls.spotify}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-3 rounded-xl px-2.5 py-2 transition hover:bg-white/[0.045] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {body}
      </a>
    );
  }

  return <div className="flex items-center gap-3 rounded-xl px-2.5 py-2">{body}</div>;
}
