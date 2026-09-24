"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { LoadSpotifySdk } from "@/components/spotify/player/sdk-loader";
import type { SpotifyPlaybackSource } from "@/lib/spotify/playback";

export type SpotifyPlayerStatus =
  | "connecting"
  | "ready"
  | "offline"
  | "reconnect_required"
  | "premium_required"
  | "unsupported"
  | "autoplay_blocked"
  | "restricted"
  | "rate_limited"
  | "error";

export interface ISpotifyNowPlaying {
  uri: string;
  spotifyUrl: string | null;
  type: "track" | "episode" | "ad";
  name: string;
  albumName: string;
  artists: string;
  imageUrl: string | undefined;
  isPlayable: boolean;
}

interface ISpotifyPlayerContextValue {
  status: SpotifyPlayerStatus;
  isReady: boolean;
  currentTrack: ISpotifyNowPlaying | null;
  position: number;
  duration: number;
  paused: boolean;
  volume: number;
  restrictions: ISpotifyWebPlaybackRestrictions;
  pendingTrackUri: string | null;
  PlayTrack: (trackUri: string, source: SpotifyPlaybackSource) => Promise<void>;
  TogglePlay: () => Promise<void>;
  Previous: () => Promise<void>;
  Next: () => Promise<void>;
  Seek: (positionMilliseconds: number) => Promise<void>;
  SetVolume: (volume: number) => Promise<void>;
}

const SpotifyPlayerContext = createContext<ISpotifyPlayerContextValue | null>(null);

export function SpotifyPlayerProvider({ children }: { children: ReactNode }) {
  const playerRef = useRef<ISpotifyPlayer | null>(null);
  const positionAnchorRef = useRef({ position: 0, timestamp: 0 });
  const [status, setStatus] = useState<SpotifyPlayerStatus>("connecting");
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [playbackState, setPlaybackState] = useState<ISpotifyWebPlaybackState | null>(null);
  const [position, setPosition] = useState(0);
  const [volume, setVolumeState] = useState(0.5);
  const [pendingTrackUri, setPendingTrackUri] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let player: ISpotifyPlayer | null = null;
    let removeListeners: (() => void) | null = null;

    async function Initialize(): Promise<void> {
      try {
        const sdk = await LoadSpotifySdk();

        if (!active) {
          return;
        }

        player = new sdk.Player({
          name: "Spotified Web Player",
          enableMediaSession: true,
          volume: 0.5,
          getOAuthToken: (callback) => {
            void RequestAccessToken()
              .then((accessToken) => {
                if (active) {
                  callback(accessToken);
                }
              })
              .catch((error: unknown) => {
                if (active) {
                  setDeviceId(null);
                  setStatus(GetRequestFailureStatus(error));
                  callback("");
                }
              });
          },
        });
        playerRef.current = player;

        const HandleReady = ({ device_id: readyDeviceId }: ISpotifyWebPlaybackPlayer): void => {
          if (!active) {
            return;
          }

          setDeviceId(readyDeviceId);
          setStatus("ready");
          void player?.getVolume().then((currentVolume) => {
            if (active) {
              setVolumeState(currentVolume);
            }
          });
        };
        const HandleNotReady = (): void => {
          if (active) {
            setDeviceId(null);
            setStatus("offline");
          }
        };
        const HandleStateChanged = (state: ISpotifyWebPlaybackState | null): void => {
          if (!active || !state) {
            return;
          }

          positionAnchorRef.current = { position: state.position, timestamp: Date.now() };
          setPlaybackState(state);
          setPosition(state.position);
          setPendingTrackUri(null);
          setStatus("ready");
        };
        const HandleAutoplayFailed = (): void => {
          if (active) {
            setStatus("autoplay_blocked");
          }
        };
        const HandleInitializationError = (): void => {
          if (active) {
            setDeviceId(null);
            setStatus("unsupported");
          }
        };
        const HandleAuthenticationError = (): void => {
          if (active) {
            setDeviceId(null);
            setStatus("reconnect_required");
          }
        };
        const HandleAccountError = (): void => {
          if (active) {
            setDeviceId(null);
            setStatus("premium_required");
          }
        };
        const HandlePlaybackError = (): void => {
          if (active) {
            setPendingTrackUri(null);
            setStatus("error");
          }
        };

        player.addListener("ready", HandleReady);
        player.addListener("not_ready", HandleNotReady);
        player.addListener("player_state_changed", HandleStateChanged);
        player.addListener("autoplay_failed", HandleAutoplayFailed);
        player.addListener("initialization_error", HandleInitializationError);
        player.addListener("authentication_error", HandleAuthenticationError);
        player.addListener("account_error", HandleAccountError);
        player.addListener("playback_error", HandlePlaybackError);
        removeListeners = () => {
          player?.removeListener("ready", HandleReady);
          player?.removeListener("not_ready", HandleNotReady);
          player?.removeListener("player_state_changed", HandleStateChanged);
          player?.removeListener("autoplay_failed", HandleAutoplayFailed);
          player?.removeListener("initialization_error", HandleInitializationError);
          player?.removeListener("authentication_error", HandleAuthenticationError);
          player?.removeListener("account_error", HandleAccountError);
          player?.removeListener("playback_error", HandlePlaybackError);
        };

        const connected = await player.connect();

        if (active && !connected) {
          setStatus("error");
        }

        if (!active) {
          player.disconnect();
        }
      } catch (error) {
        if (active) {
          setStatus(GetRequestFailureStatus(error));
        }
      }
    }

    void Initialize();

    return () => {
      active = false;
      playerRef.current = null;
      removeListeners?.();
      player?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!playbackState || playbackState.paused) {
      return;
    }

    const interval = window.setInterval(() => {
      const elapsed = Date.now() - positionAnchorRef.current.timestamp;
      setPosition(Math.min(playbackState.duration, positionAnchorRef.current.position + elapsed));
    }, 250);

    return () => window.clearInterval(interval);
  }, [playbackState]);

  const RunPlayerAction = useCallback(async (action: () => Promise<void>): Promise<void> => {
    try {
      await action();
    } catch {
      setStatus("error");
    }
  }, []);

  const PlayTrack = useCallback(
    async (trackUri: string, source: SpotifyPlaybackSource): Promise<void> => {
      const player = playerRef.current;

      if (!player || !deviceId) {
        setStatus(status === "connecting" ? "connecting" : "offline");
        return;
      }

      setPendingTrackUri(trackUri);

      try {
        const activation = player.activateElement();
        await activation;

        if (playbackState?.track_window.current_track.uri === trackUri) {
          if (playbackState.paused && !playbackState.disallows.resuming) {
            await player.resume();
          } else if (!playbackState.paused && !playbackState.disallows.pausing) {
            await player.pause();
          }

          setPendingTrackUri(null);
          return;
        }

        await RequestPlayback(deviceId, trackUri, source);
      } catch (error) {
        setPendingTrackUri(null);
        setStatus(GetRequestFailureStatus(error));
      }
    },
    [deviceId, playbackState, status],
  );

  const TogglePlay = useCallback(async (): Promise<void> => {
    const player = playerRef.current;

    if (!player || !playbackState) {
      return;
    }

    if (playbackState.paused) {
      if (!playbackState.disallows.resuming) {
        await RunPlayerAction(() => player.resume());
      }
    } else if (!playbackState.disallows.pausing) {
      await RunPlayerAction(() => player.pause());
    }
  }, [playbackState, RunPlayerAction]);

  const Previous = useCallback(async (): Promise<void> => {
    const player = playerRef.current;

    if (player && playbackState && !playbackState.disallows.skipping_prev) {
      await RunPlayerAction(() => player.previousTrack());
    }
  }, [playbackState, RunPlayerAction]);

  const Next = useCallback(async (): Promise<void> => {
    const player = playerRef.current;

    if (player && playbackState && !playbackState.disallows.skipping_next) {
      await RunPlayerAction(() => player.nextTrack());
    }
  }, [playbackState, RunPlayerAction]);

  const Seek = useCallback(
    async (positionMilliseconds: number): Promise<void> => {
      const player = playerRef.current;

      if (!player || !playbackState || playbackState.disallows.seeking) {
        return;
      }

      const nextPosition = Math.min(Math.max(positionMilliseconds, 0), playbackState.duration);
      positionAnchorRef.current = { position: nextPosition, timestamp: Date.now() };
      setPosition(nextPosition);
      await RunPlayerAction(() => player.seek(nextPosition));
    },
    [playbackState, RunPlayerAction],
  );

  const SetVolume = useCallback(
    async (nextVolume: number): Promise<void> => {
      const player = playerRef.current;

      if (!player) {
        return;
      }

      const normalizedVolume = Math.min(Math.max(nextVolume, 0), 1);
      setVolumeState(normalizedVolume);
      await RunPlayerAction(() => player.setVolume(normalizedVolume));
    },
    [RunPlayerAction],
  );

  const currentTrack = useMemo(
    () => MapNowPlaying(playbackState?.track_window.current_track ?? null),
    [playbackState],
  );

  const contextValue = useMemo<ISpotifyPlayerContextValue>(
    () => ({
      status,
      isReady: deviceId !== null,
      currentTrack,
      position,
      duration: playbackState?.duration ?? 0,
      paused: playbackState?.paused ?? true,
      volume,
      restrictions: playbackState?.disallows ?? {},
      pendingTrackUri,
      PlayTrack,
      TogglePlay,
      Previous,
      Next,
      Seek,
      SetVolume,
    }),
    [
      status,
      deviceId,
      currentTrack,
      position,
      playbackState,
      volume,
      pendingTrackUri,
      PlayTrack,
      TogglePlay,
      Previous,
      Next,
      Seek,
      SetVolume,
    ],
  );

  return (
    <SpotifyPlayerContext.Provider value={contextValue}>{children}</SpotifyPlayerContext.Provider>
  );
}

export function useSpotifyPlayer(): ISpotifyPlayerContextValue {
  const context = useContext(SpotifyPlayerContext);

  if (!context) {
    throw new Error("SpotifyPlayerProvider is required.");
  }

  return context;
}

class SpotifyPlayerRequestError extends Error {
  public readonly errorCode: string;

  public constructor(errorCode: string) {
    super("Spotify playback could not complete the request.");
    this.name = "SpotifyPlayerRequestError";
    this.errorCode = errorCode;
  }
}

async function RequestAccessToken(): Promise<string> {
  const response = await fetch("/api/spotify/player/token", {
    headers: { Accept: "application/json" },
    cache: "no-store",
    credentials: "same-origin",
  });
  const body = await ReadJson(response);

  if (!response.ok) {
    throw new SpotifyPlayerRequestError(ReadErrorCode(body));
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("accessToken" in body) ||
    typeof body.accessToken !== "string" ||
    body.accessToken.length === 0
  ) {
    throw new SpotifyPlayerRequestError("token_unavailable");
  }

  return body.accessToken;
}

async function RequestPlayback(
  deviceId: string,
  trackUri: string,
  source: SpotifyPlaybackSource,
): Promise<void> {
  const payload =
    source.type === "context"
      ? { deviceId, trackUri, sourceType: "context", contextUri: source.contextUri }
      : {
          deviceId,
          trackUri,
          sourceType: "queue",
          uris: source.uris.length > 0 ? source.uris : [trackUri],
        };
  const response = await fetch("/api/spotify/player/play", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new SpotifyPlayerRequestError(ReadErrorCode(await ReadJson(response)));
  }
}

function GetRequestFailureStatus(error: unknown): SpotifyPlayerStatus {
  if (!(error instanceof SpotifyPlayerRequestError)) {
    return "error";
  }

  if (
    error.errorCode === "missing_scopes" ||
    error.errorCode === "reconnect_required" ||
    error.errorCode === "unauthorized"
  ) {
    return "reconnect_required";
  }

  if (error.errorCode === "playback_forbidden") {
    return "restricted";
  }

  if (error.errorCode === "rate_limited") {
    return "rate_limited";
  }

  return "error";
}

function MapNowPlaying(track: ISpotifyWebPlaybackTrack | null): ISpotifyNowPlaying | null {
  if (!track) {
    return null;
  }

  return {
    uri: track.uri,
    spotifyUrl: GetSpotifyUrl(track.uri),
    type: track.type,
    name: track.name,
    albumName: track.album.name,
    artists: track.artists.map((artist) => artist.name).join(", "),
    imageUrl: track.album.images[0]?.url,
    isPlayable: track.is_playable,
  };
}

function GetSpotifyUrl(uri: string): string | null {
  const [provider, type, id] = uri.split(":");

  if (provider !== "spotify" || !id || (type !== "track" && type !== "episode")) {
    return null;
  }

  return `https://open.spotify.com/${type}/${encodeURIComponent(id)}`;
}

function ReadErrorCode(body: unknown): string {
  if (
    typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof body.error === "string"
  ) {
    return body.error;
  }

  return "request_failed";
}

async function ReadJson(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}
