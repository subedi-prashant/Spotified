import { ExternalLink } from "lucide-react";

import { TrackPlayButton } from "@/components/spotify/player/track-play-button";
import { Artwork } from "@/components/spotify/artwork";
import { FormatArtists, FormatDuration } from "@/lib/spotify/format";
import { IsSpotifyTrackUri } from "@/lib/spotify/playback";
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
  const playbackUri = !track.is_local && IsSpotifyTrackUri(track.uri) ? track.uri : null;
  const details = (
    <>
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
    </>
  );

  return (
    <div
      className={Cn(
        "group flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition hover:bg-white/[0.045]",
        className,
      )}
    >
      {rank ? (
        <span className="w-5 shrink-0 text-center text-xs font-semibold tabular-nums text-muted-foreground">
          {rank}
        </span>
      ) : null}
      {playbackUri ? <TrackPlayButton trackUri={playbackUri} trackName={track.name} /> : null}
      {spotifyUrl ? (
        <a
          href={spotifyUrl}
          target="_blank"
          rel="noreferrer"
          className="flex min-w-0 flex-1 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {details}
        </a>
      ) : (
        <span className="flex min-w-0 flex-1 items-center gap-3">{details}</span>
      )}
      <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
        {trailing ?? FormatDuration(track.duration_ms)}
      </span>
      {spotifyUrl ? (
        <a
          href={spotifyUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${track.name} in Spotify`}
          className="grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground opacity-60 transition hover:bg-white/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:opacity-0 sm:group-hover:opacity-70 sm:focus-visible:opacity-100"
        >
          <ExternalLink className="size-3.5" aria-hidden="true" />
        </a>
      ) : null}
    </div>
  );
}
