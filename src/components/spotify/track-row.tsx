import { Fragment } from "react";
import { ExternalLink } from "lucide-react";

import { TrackPlayButton } from "@/components/spotify/player/track-play-button";
import { Artwork } from "@/components/spotify/artwork";
import { FormatDuration } from "@/lib/spotify/format";
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
  const albumUrl = track.album.external_urls.spotify;
  const playbackUri = !track.is_local && IsSpotifyTrackUri(track.uri) ? track.uri : null;

  return (
    <div
      className={Cn(
        "group grid grid-cols-[auto_auto_3rem_minmax(0,1fr)_auto] items-center gap-2 border-b border-foreground/25 px-1 py-2.5 transition hover:bg-accent/70",
        className,
      )}
    >
      <span className="w-7 shrink-0 text-center text-[0.68rem] font-semibold tabular-nums text-muted-foreground">
        {rank ? String(rank).padStart(2, "0") : "—"}
      </span>
      {playbackUri ? (
        <TrackPlayButton trackUri={playbackUri} trackName={track.name} />
      ) : (
        <span className="size-8" />
      )}
      <Artwork
        src={track.album.images[0]?.url}
        alt={`${track.album.name} cover`}
        className="size-12"
      />
      <span className="min-w-0 py-0.5">
        <span className="flex min-w-0 items-center gap-2">
          {spotifyUrl ? (
            <a
              href={spotifyUrl}
              target="_blank"
              rel="noreferrer"
              className="truncate font-display text-base font-bold uppercase leading-none tracking-[0.02em] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {track.name}
            </a>
          ) : (
            <span className="truncate font-display text-base font-bold uppercase leading-none tracking-[0.02em]">
              {track.name}
            </span>
          )}
          {track.explicit ? (
            <span
              className="border border-foreground px-1 text-[0.55rem] font-bold"
              title="Explicit"
            >
              E
            </span>
          ) : null}
        </span>
        <span className="mt-1 flex min-w-0 flex-wrap items-center gap-x-1 text-[0.7rem] leading-4 text-muted-foreground">
          {albumUrl ? (
            <a
              href={albumUrl}
              target="_blank"
              rel="noreferrer"
              className="truncate hover:text-foreground hover:underline"
            >
              {track.album.name}
            </a>
          ) : (
            <span className="truncate">{track.album.name}</span>
          )}
          <span aria-hidden="true">/</span>
          <span className="truncate">
            {track.artists.map((artist, index) => (
              <Fragment key={`${artist.id ?? artist.name}-${index}`}>
                {index > 0 ? ", " : null}
                {artist.external_urls.spotify ? (
                  <a
                    href={artist.external_urls.spotify}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-foreground hover:underline"
                  >
                    {artist.name}
                  </a>
                ) : (
                  artist.name
                )}
              </Fragment>
            ))}
          </span>
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-2 text-[0.68rem] tabular-nums text-muted-foreground">
        <span className="hidden sm:block">{trailing ?? FormatDuration(track.duration_ms)}</span>
        {spotifyUrl ? (
          <a
            href={spotifyUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${track.name} in Spotify`}
            className="grid size-8 place-items-center border border-transparent transition hover:border-foreground hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
        ) : null}
      </span>
    </div>
  );
}
