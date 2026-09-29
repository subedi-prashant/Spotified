import { ExternalLink } from "lucide-react";

import { Artwork } from "@/components/spotify/artwork";
import type { SpotifyArtist } from "@/lib/spotify/schemas";

export function ArtistCard({ artist, rank }: { artist: SpotifyArtist; rank?: number }) {
  const spotifyUrl = artist.external_urls.spotify;
  const body = (
    <>
      <Artwork
        src={artist.images[0]?.url}
        alt={`${artist.name} portrait`}
        kind="artist"
        className="aspect-square w-full"
      />
      <span className="flex min-w-0 flex-1 flex-col border-t border-foreground p-3">
        {rank ? (
          <span className="mb-3 w-fit bg-primary px-2 py-1 text-[0.65rem] font-bold tabular-nums">
            RANK / {String(rank).padStart(2, "0")}
          </span>
        ) : null}
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate font-display text-lg font-bold uppercase leading-none tracking-[0.02em]">
            {artist.name}
          </span>
          {spotifyUrl ? <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" /> : null}
        </span>
        <span className="mt-2 block truncate text-[0.7rem] uppercase tracking-[0.06em] text-muted-foreground">
          {artist.genres.slice(0, 2).join(" / ") || "Artist"}
        </span>
      </span>
    </>
  );

  if (spotifyUrl) {
    return (
      <a
        href={spotifyUrl}
        target="_blank"
        rel="noreferrer"
        className="group flex min-w-0 flex-col border border-foreground/45 bg-card transition hover:bg-accent focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring"
      >
        {body}
      </a>
    );
  }

  return <div className="flex min-w-0 flex-col border border-foreground/45 bg-card">{body}</div>;
}
