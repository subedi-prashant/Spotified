export {};

declare global {
  interface ISpotifySdk {
    Player: new (options: ISpotifyPlayerOptions) => ISpotifyPlayer;
  }

  interface ISpotifyPlayerOptions {
    name: string;
    getOAuthToken: (callback: (accessToken: string) => void) => void;
    volume?: number;
    enableMediaSession?: boolean;
  }

  interface ISpotifyPlayerEventMap {
    ready: ISpotifyWebPlaybackPlayer;
    not_ready: ISpotifyWebPlaybackPlayer;
    player_state_changed: ISpotifyWebPlaybackState | null;
    autoplay_failed: null;
    initialization_error: ISpotifyWebPlaybackError;
    authentication_error: ISpotifyWebPlaybackError;
    account_error: ISpotifyWebPlaybackError;
    playback_error: ISpotifyWebPlaybackError;
  }

  interface ISpotifyPlayer {
    connect(): Promise<boolean>;
    disconnect(): void;
    addListener<TEvent extends keyof ISpotifyPlayerEventMap>(
      event: TEvent,
      callback: (value: ISpotifyPlayerEventMap[TEvent]) => void,
    ): boolean;
    removeListener<TEvent extends keyof ISpotifyPlayerEventMap>(
      event: TEvent,
      callback?: (value: ISpotifyPlayerEventMap[TEvent]) => void,
    ): boolean;
    getCurrentState(): Promise<ISpotifyWebPlaybackState | null>;
    getVolume(): Promise<number>;
    setVolume(volume: number): Promise<void>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    togglePlay(): Promise<void>;
    seek(positionMilliseconds: number): Promise<void>;
    previousTrack(): Promise<void>;
    nextTrack(): Promise<void>;
    activateElement(): Promise<void>;
  }

  interface ISpotifyWebPlaybackPlayer {
    device_id: string;
  }

  interface ISpotifyWebPlaybackError {
    message: string;
  }

  interface ISpotifyWebPlaybackRestrictions {
    pausing?: boolean;
    peeking_next?: boolean;
    peeking_prev?: boolean;
    resuming?: boolean;
    seeking?: boolean;
    skipping_next?: boolean;
    skipping_prev?: boolean;
  }

  interface ISpotifyWebPlaybackImage {
    url: string;
    height?: number | null;
    width?: number | null;
  }

  interface ISpotifyWebPlaybackArtist {
    name: string;
    uri: string;
  }

  interface ISpotifyWebPlaybackTrack {
    id: string | null;
    uri: string;
    type: "track" | "episode" | "ad";
    media_type: "audio" | "video";
    name: string;
    is_playable: boolean;
    album: {
      name: string;
      uri: string;
      images: ISpotifyWebPlaybackImage[];
    };
    artists: ISpotifyWebPlaybackArtist[];
  }

  interface ISpotifyWebPlaybackState {
    context: {
      uri: string | null;
      metadata: Record<string, unknown> | null;
    };
    disallows: ISpotifyWebPlaybackRestrictions;
    paused: boolean;
    position: number;
    duration: number;
    repeat_mode: number;
    shuffle: boolean;
    track_window: {
      current_track: ISpotifyWebPlaybackTrack;
      previous_tracks: ISpotifyWebPlaybackTrack[];
      next_tracks: ISpotifyWebPlaybackTrack[];
    };
  }

  interface Window {
    Spotify?: ISpotifySdk;
    onSpotifyWebPlaybackSDKReady?: () => void;
  }
}
