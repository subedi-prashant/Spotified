import { describe, expect, it } from "vitest";

import {
  BuildSpotifyQueue,
  GetSpotifyTrackUris,
  SPOTIFY_QUEUE_LIMIT,
  SpotifyPlayRequestSchema,
} from "@/lib/spotify/playback";

const TRACK_A = `spotify:track:${"A".repeat(22)}`;
const TRACK_B = `spotify:track:${"B".repeat(22)}`;
const TRACK_C = `spotify:track:${"C".repeat(22)}`;
const PLAYLIST = `spotify:playlist:${"P".repeat(22)}`;

function TrackUri(index: number): string {
  return `spotify:track:${index.toString(36).padStart(22, "0")}`;
}

describe("Spotify playback requests", () => {
  it("accepts a selected song in a playlist context", () => {
    expect(
      SpotifyPlayRequestSchema.safeParse({
        deviceId: "device123",
        trackUri: TRACK_A,
        sourceType: "context",
        contextUri: PLAYLIST,
      }).success,
    ).toBe(true);
  });

  it("rejects malformed URIs and oversized queues", () => {
    const oversizedQueue = Array.from({ length: SPOTIFY_QUEUE_LIMIT + 1 }, (_, index) =>
      TrackUri(index),
    );

    expect(
      SpotifyPlayRequestSchema.safeParse({
        deviceId: "device123",
        trackUri: "spotify:episode:not-a-track",
        sourceType: "queue",
        uris: [TRACK_A],
      }).success,
    ).toBe(false);
    expect(
      SpotifyPlayRequestSchema.safeParse({
        deviceId: "device123",
        trackUri: oversizedQueue[0],
        sourceType: "queue",
        uris: oversizedQueue,
      }).success,
    ).toBe(false);
  });

  it("rotates the visible source order around the selected song", () => {
    expect(BuildSpotifyQueue([TRACK_A, TRACK_B, TRACK_C], TRACK_B)).toEqual([
      TRACK_B,
      TRACK_C,
      TRACK_A,
    ]);
  });

  it("deduplicates queues and ignores malformed track URIs", () => {
    expect(
      BuildSpotifyQueue([TRACK_A, "spotify:episode:invalid", TRACK_B, TRACK_A], TRACK_A),
    ).toEqual([TRACK_A, TRACK_B]);
    expect(BuildSpotifyQueue([TRACK_A], TRACK_C)).toEqual([]);
  });

  it("excludes local, malformed, and duplicate tracks from visible queues", () => {
    expect(
      GetSpotifyTrackUris([
        { uri: TRACK_A, is_local: false },
        { uri: TRACK_A, is_local: false },
        { uri: TRACK_B, is_local: true },
        { uri: "spotify:episode:invalid", is_local: false },
        { uri: TRACK_C, is_local: false },
      ]),
    ).toEqual([TRACK_A, TRACK_C]);
  });

  it("caps a constructed queue at the provider command limit", () => {
    const uris = Array.from({ length: SPOTIFY_QUEUE_LIMIT + 10 }, (_, index) => TrackUri(index));
    expect(BuildSpotifyQueue(uris, uris[0] ?? "")).toHaveLength(SPOTIFY_QUEUE_LIMIT);
  });
});
