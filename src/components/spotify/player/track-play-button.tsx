"use client";

import { LoaderCircle, Pause, Play } from "lucide-react";

import { useSpotifyPlaybackSource } from "@/components/spotify/player/playback-source";
import { useSpotifyPlayer } from "@/components/spotify/player/spotify-player-provider";
import { Cn } from "@/lib/utils";

export function TrackPlayButton({
  trackUri,
  trackName,
  className,
}: {
  trackUri: string;
  trackName: string;
  className?: string;
}) {
  const source = useSpotifyPlaybackSource();
  const { currentTrack, isReady, paused, pendingTrackUri, PlayTrack } = useSpotifyPlayer();
  const isCurrent = currentTrack?.uri === trackUri;
  const isPending = pendingTrackUri === trackUri;
  const isPlaying = isCurrent && !paused;
  const label = isPending
    ? `Starting ${trackName}`
    : isPlaying
      ? `Pause ${trackName}`
      : `Play ${trackName}`;

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={!isReady || isPending}
      onClick={() => void PlayTrack(trackUri, source)}
      className={Cn(
        "grid size-8 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.045] text-muted-foreground transition hover:border-white/20 hover:bg-white/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-35",
        isCurrent && "border-primary/30 bg-primary/10 text-primary",
        className,
      )}
    >
      {isPending ? (
        <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />
      ) : isPlaying ? (
        <Pause className="size-3.5 fill-current" aria-hidden="true" />
      ) : (
        <Play className="ml-0.5 size-3.5 fill-current" aria-hidden="true" />
      )}
    </button>
  );
}
