import { ExternalLink } from "lucide-react";

import { Artwork } from "@/components/spotify/artwork";
import { FormatArtists, FormatDuration } from "@/lib/spotify/format";
import type { SpotifyTrack } from "@/lib/spotify/schemas";
import { Cn } from "@/lib/utils";

export function TrackRow({
  track,
  rank,
  trailing,
  className,
}: {
  track: SpotifyTrack;
  rank?: number;
  trailing?: string;
  className?: string;
}) {
  const spotifyUrl = track.external_urls.spotify;
  const content = (
    <>
      {rank ? (
        <span className="w-5 shrink-0 text-center text-xs font-semibold tabular-nums text-muted-foreground">
          {rank}
        </span>
      ) : null}
      <Artwork
        src={track.album.images[0]?.url}
        alt={`${track.album.name} cover`}
        className="size-11"
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-foreground">{track.name}</span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
          {FormatArtists(track.artists)}
        </span>
      </span>
      <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
        {trailing ?? FormatDuration(track.duration_ms)}
      </span>
      {spotifyUrl ? (
        <ExternalLink className="size-3.5 shrink-0 opacity-0 transition group-hover:opacity-70" />
      ) : null}
    </>
  );

  if (spotifyUrl) {
    return (
      <a
        href={spotifyUrl}
        target="_blank"
        rel="noreferrer"
        className={Cn(
          "group flex items-center gap-3 rounded-xl px-2.5 py-2 transition hover:bg-white/[0.045] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className,
        )}
      >
        {content}
      </a>
    );
  }

  return (
    <div className={Cn("flex items-center gap-3 rounded-xl px-2.5 py-2", className)}>{content}</div>
  );
}
