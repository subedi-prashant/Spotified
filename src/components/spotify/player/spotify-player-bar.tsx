"use client";

import { useState } from "react";
import {
  AlertCircle,
  ExternalLink,
  LoaderCircle,
  Pause,
  Play,
  RefreshCw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";

import {
  useSpotifyPlayer,
  type SpotifyPlayerStatus,
} from "@/components/spotify/player/spotify-player-provider";
import { Artwork } from "@/components/spotify/artwork";
import { Button } from "@/components/ui/button";
import { FormatDuration } from "@/lib/spotify/format";
import { Cn } from "@/lib/utils";

const STATUS_MESSAGES: Record<SpotifyPlayerStatus, { title: string; description: string }> = {
  connecting: {
    title: "Connecting the web player",
    description: "Registering this browser as a private Spotify Connect device.",
  },
  ready: {
    title: "Web player ready",
    description: "Choose a song to start full-length playback in this browser.",
  },
  offline: {
    title: "Web player is offline",
    description: "Check the connection, then reload this page to reconnect the browser player.",
  },
  reconnect_required: {
    title: "Reconnect Spotify for playback",
    description: "Approve the new Premium playback permissions to use the browser player.",
  },
  premium_required: {
    title: "Spotify Premium is required",
    description: "The Web Playback SDK does not support Free or mobile-only Premium plans.",
  },
  unsupported: {
    title: "Playback is unavailable in this browser",
    description:
      "Use a current Chrome, Firefox, Safari, or Edge browser with protected audio enabled.",
  },
  autoplay_blocked: {
    title: "The browser blocked playback",
    description: "Choose the song again so playback begins from a direct interaction.",
  },
  restricted: {
    title: "Spotify could not play that song here",
    description: "The item or account is currently restricted from browser playback.",
  },
  rate_limited: {
    title: "Spotify is asking the player to slow down",
    description: "Wait briefly, then choose the song again.",
  },
  error: {
    title: "The web player needs another try",
    description: "Reload the page to reconnect without changing your Spotify library.",
  },
};

export function SpotifyPlayerBar() {
  const {
    status,
    isReady,
    currentTrack,
    position,
    duration,
    paused,
    volume,
    restrictions,
    TogglePlay,
    Previous,
    Next,
    Seek,
    SetVolume,
  } = useSpotifyPlayer();
  const [seekPreview, setSeekPreview] = useState<{
    trackUri: string;
    position: number;
  } | null>(null);

  if (!currentTrack || !isReady) {
    return <PlayerStatus status={status} />;
  }

  const displayedPosition =
    seekPreview?.trackUri === currentTrack.uri ? seekPreview.position : position;
  const canToggle = paused ? !restrictions.resuming : !restrictions.pausing;
  const canSeek = duration > 0 && !restrictions.seeking;
  const CommitSeek = (): void => {
    if (seekPreview?.trackUri === currentTrack.uri) {
      void Seek(seekPreview.position);
      setSeekPreview(null);
    }
  };

  return (
    <section
      className="fixed inset-x-3 bottom-[5.9rem] z-50 mx-auto max-w-7xl rounded-2xl border border-white/10 bg-[#121212]/95 px-3 py-3 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.9)] backdrop-blur-2xl sm:px-4 md:bottom-3"
      aria-label="Spotify web player"
    >
      <div className="grid items-center gap-3 md:grid-cols-[minmax(0,1fr)_minmax(18rem,1.25fr)_minmax(0,1fr)] md:gap-5">
        <div className="flex min-w-0 items-center gap-3">
          {currentTrack.spotifyUrl ? (
            <a
              href={currentTrack.spotifyUrl}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`Open ${currentTrack.name} in Spotify`}
            >
              <Artwork
                src={currentTrack.imageUrl}
                alt={`${currentTrack.albumName} cover`}
                className="size-11 rounded sm:size-12"
              />
            </a>
          ) : (
            <Artwork
              src={currentTrack.imageUrl}
              alt={`${currentTrack.albumName} cover`}
              className="size-11 rounded sm:size-12"
            />
          )}
          <div className="min-w-0 flex-1">
            {currentTrack.spotifyUrl ? (
              <a
                href={currentTrack.spotifyUrl}
                target="_blank"
                rel="noreferrer"
                title={`${currentTrack.name}${currentTrack.artists ? ` by ${currentTrack.artists}` : ""}`}
                className="group/link block min-w-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-semibold text-white">
                    {currentTrack.name}
                  </span>
                  <ExternalLink
                    className="size-3 shrink-0 text-neutral-500 transition group-hover/link:text-neutral-300"
                    aria-hidden="true"
                  />
                </span>
                <span className="mt-0.5 block truncate text-xs text-neutral-400">
                  {currentTrack.artists || currentTrack.albumName}
                </span>
              </a>
            ) : (
              <>
                <p className="truncate text-sm font-semibold text-white">{currentTrack.name}</p>
                <p className="mt-0.5 truncate text-xs text-neutral-400">
                  {currentTrack.artists || currentTrack.albumName}
                </p>
              </>
            )}
          </div>
        </div>

        <div className="grid min-w-0 gap-2">
          <div className="flex items-center justify-center gap-2">
            <PlayerControl
              label="Previous song"
              disabled={restrictions.skipping_prev}
              onClick={() => void Previous()}
            >
              <SkipBack className="size-4 fill-current" aria-hidden="true" />
            </PlayerControl>
            <PlayerControl
              label={paused ? "Play" : "Pause"}
              disabled={!canToggle}
              prominent
              onClick={() => void TogglePlay()}
            >
              {paused ? (
                <Play className="ml-0.5 size-4 fill-current" aria-hidden="true" />
              ) : (
                <Pause className="size-4 fill-current" aria-hidden="true" />
              )}
            </PlayerControl>
            <PlayerControl
              label="Next song"
              disabled={restrictions.skipping_next}
              onClick={() => void Next()}
            >
              <SkipForward className="size-4 fill-current" aria-hidden="true" />
            </PlayerControl>
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <span className="w-9 shrink-0 text-right text-[0.65rem] tabular-nums text-neutral-500">
              {FormatDuration(displayedPosition)}
            </span>
            <input
              type="range"
              min={0}
              max={Math.max(duration, 1)}
              step={1_000}
              value={Math.min(displayedPosition, Math.max(duration, 1))}
              disabled={!canSeek}
              onChange={(event) =>
                setSeekPreview({
                  trackUri: currentTrack.uri,
                  position: Number(event.currentTarget.value),
                })
              }
              onPointerUp={CommitSeek}
              onKeyUp={CommitSeek}
              onBlur={CommitSeek}
              aria-label="Song position"
              aria-valuetext={`${FormatDuration(displayedPosition)} of ${FormatDuration(duration)}`}
              className="spotify-player-range min-w-0 flex-1"
            />
            <span className="w-9 shrink-0 text-[0.65rem] tabular-nums text-neutral-500">
              {FormatDuration(duration)}
            </span>
          </div>
        </div>

        <div className="hidden min-w-0 items-center justify-end gap-4 md:flex">
          <div className="flex w-28 items-center gap-2">
            {volume === 0 ? (
              <VolumeX className="size-4 shrink-0 text-neutral-400" aria-hidden="true" />
            ) : (
              <Volume2 className="size-4 shrink-0 text-neutral-400" aria-hidden="true" />
            )}
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(event) => void SetVolume(Number(event.currentTarget.value))}
              aria-label="Player volume"
              aria-valuetext={`${Math.round(volume * 100)} percent`}
              className="spotify-player-range min-w-0 flex-1"
            />
          </div>
        </div>
      </div>
      {status !== "ready" ? (
        <p className="mt-2 text-center text-[0.65rem] font-medium text-amber-200" role="status">
          {STATUS_MESSAGES[status].description}
        </p>
      ) : null}
    </section>
  );
}

function PlayerStatus({ status }: { status: SpotifyPlayerStatus }) {
  const message = STATUS_MESSAGES[status];
  const connecting = status === "connecting";
  const canRetry = status === "offline" || status === "error";

  return (
    <section
      className="fixed inset-x-3 bottom-[5.9rem] z-50 mx-auto flex max-w-3xl items-center gap-3 rounded-2xl border border-white/10 bg-[#121212]/95 px-4 py-3 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.9)] backdrop-blur-2xl md:bottom-3"
      aria-label="Spotify web player status"
      role="status"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/[0.06] text-neutral-300">
        {connecting ? (
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <AlertCircle className="size-4" aria-hidden="true" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">{message.title}</p>
        <p className="truncate text-xs text-neutral-400">{message.description}</p>
      </div>
      {status === "reconnect_required" ? (
        <form action="/api/auth/spotify/reconnect" method="post" className="shrink-0">
          <Button type="submit" size="sm">
            Reconnect
          </Button>
        </form>
      ) : null}
      {canRetry ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="shrink-0"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="size-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">Retry</span>
        </Button>
      ) : null}
    </section>
  );
}

function PlayerControl({
  label,
  disabled,
  prominent = false,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  prominent?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={Cn(
        "grid size-8 place-items-center rounded-full text-neutral-300 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-30",
        prominent && "size-9 bg-white text-black hover:bg-neutral-200 hover:text-black",
      )}
    >
      {children}
    </button>
  );
}
