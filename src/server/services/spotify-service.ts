import "server-only";

import type { SpotifyTimeRange } from "@/lib/spotify/client";
import { RunSpotifyOperation } from "@/server/services/spotify-token-service";

export function GetSpotifyProfile(userId: string) {
  return RunSpotifyOperation(userId, (client) => client.GetProfile());
}

export async function GetSpotifySnapshot(userId: string, timeRange: SpotifyTimeRange) {
  const [profile, topArtists, topTracks, recentlyPlayed] = await Promise.all([
    GetSpotifyProfile(userId),
    RunSpotifyOperation(userId, (client) => client.GetTopArtists(timeRange, 8)),
    RunSpotifyOperation(userId, (client) => client.GetTopTracks(timeRange, 8)),
    RunSpotifyOperation(userId, (client) => client.GetRecentlyPlayed(8)),
  ]);

  return { profile, topArtists, topTracks, recentlyPlayed };
}

export async function GetSpotifyCollections(userId: string, offset: number) {
  const [playlists, savedTracks] = await Promise.all([
    RunSpotifyOperation(userId, (client) => client.GetPlaylists(24, offset)),
    RunSpotifyOperation(userId, (client) => client.GetSavedTracks(24, offset)),
  ]);

  return { playlists, savedTracks };
}

export async function GetSpotifyPlaylistDetails(
  userId: string,
  playlistId: string,
  offset: number,
) {
  const [playlist, items] = await Promise.all([
    RunSpotifyOperation(userId, (client) => client.GetPlaylist(playlistId)),
    RunSpotifyOperation(userId, (client) => client.GetPlaylistItems(playlistId, 50, offset)),
  ]);

  return { playlist, items };
}

export function GetSpotifyRecent(userId: string) {
  return RunSpotifyOperation(userId, (client) => client.GetRecentlyPlayed(50));
}

export function SearchSpotify(userId: string, query: string) {
  return RunSpotifyOperation(userId, (client) => client.Search(query, 10));
}
