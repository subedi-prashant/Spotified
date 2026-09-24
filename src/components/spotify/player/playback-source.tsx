"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { SpotifyPlaybackSource } from "@/lib/spotify/playback";

const DEFAULT_SOURCE: SpotifyPlaybackSource = { type: "queue", uris: [] };
const PlaybackSourceContext = createContext<SpotifyPlaybackSource>(DEFAULT_SOURCE);

export function SpotifyPlaybackSourceProvider({
  source,
  children,
}: {
  source: SpotifyPlaybackSource;
  children: ReactNode;
}) {
  return <PlaybackSourceContext.Provider value={source}>{children}</PlaybackSourceContext.Provider>;
}

export function useSpotifyPlaybackSource(): SpotifyPlaybackSource {
  return useContext(PlaybackSourceContext);
}
