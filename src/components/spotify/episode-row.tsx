import { ExternalLink } from "lucide-react";

import { Artwork } from "@/components/spotify/artwork";
import { FormatDuration } from "@/lib/spotify/format";
import type { SpotifyPlayableItem } from "@/lib/spotify/schemas";

export function EpisodeRow({
  episode,
}: {
  episode: Extract<SpotifyPlayableItem, { type: "episode" }>;
}) {
  const body = (
    <>
      <Artwork src={episode.images[0]?.url} alt={`${episode.name} artwork`} className="size-12" />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-display text-base font-bold uppercase leading-none">
          {episode.name}
        </span>
        <span className="mt-1 block truncate text-[0.7rem] uppercase tracking-[0.06em] text-muted-foreground">
          Podcast episode / Spotify only
        </span>
      </span>
      <span className="hidden text-[0.68rem] tabular-nums text-muted-foreground sm:block">
        {FormatDuration(episode.duration_ms)}
      </span>
      {episode.external_urls.spotify ? (
        <ExternalLink className="size-3.5 text-muted-foreground" aria-hidden="true" />
      ) : null}
    </>
  );

  if (episode.external_urls.spotify) {
    return (
      <a
        href={episode.external_urls.spotify}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-3 border-b border-foreground/25 px-2 py-2.5 transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {body}
      </a>
    );
  }

  return (
    <div className="flex items-center gap-3 border-b border-foreground/25 px-2 py-2.5">{body}</div>
  );
}
