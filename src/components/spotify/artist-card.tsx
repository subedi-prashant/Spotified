import { ExternalLink } from "lucide-react";

import { Artwork } from "@/components/spotify/artwork";
import type { SpotifyArtist } from "@/lib/spotify/schemas";

export function ArtistCard({ artist, rank }: { artist: SpotifyArtist; rank?: number }) {
  const spotifyUrl = artist.external_urls.spotify;
  const body = (
    <>
      <div className="relative">
        <Artwork
          src={artist.images[0]?.url}
          alt={`${artist.name} portrait`}
          kind="artist"
          className="aspect-square w-full rounded-2xl"
        />
        {rank ? (
          <span className="absolute -bottom-2 left-3 grid size-7 place-items-center rounded-full border border-white/10 bg-neutral-950 text-[0.7rem] font-bold tabular-nums text-white shadow-xl">
            {rank}
          </span>
        ) : null}
      </div>
      <div className="min-w-0 space-y-1 px-1 pt-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-sm font-semibold text-foreground">{artist.name}</span>
          {spotifyUrl ? <ExternalLink className="size-3 shrink-0 text-muted-foreground" /> : null}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {artist.genres.slice(0, 2).join(" · ") || "Artist"}
        </span>
      </div>
    </>
  );

  if (spotifyUrl) {
    return (
      <a
        href={spotifyUrl}
        target="_blank"
        rel="noreferrer"
        className="group flex min-w-0 flex-col gap-3 rounded-[1.25rem] p-2 transition hover:bg-white/[0.045] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {body}
      </a>
    );
  }

  return <div className="flex min-w-0 flex-col gap-3 rounded-[1.25rem] p-2">{body}</div>;
}
