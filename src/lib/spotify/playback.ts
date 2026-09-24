import { z } from "zod";

export const SPOTIFY_QUEUE_LIMIT = 50;

export const SpotifyTrackUriSchema = z.string().regex(/^spotify:track:[A-Za-z0-9]{22}$/);
export const SpotifyPlaylistUriSchema = z.string().regex(/^spotify:playlist:[A-Za-z0-9]{22}$/);

const SpotifyDeviceIdSchema = z
  .string()
  .regex(/^[A-Za-z0-9]+$/)
  .max(128);

const SpotifyPlayRequestBaseSchema = z.object({
  deviceId: SpotifyDeviceIdSchema,
  trackUri: SpotifyTrackUriSchema,
});

export const SpotifyPlayRequestSchema = z.discriminatedUnion("sourceType", [
  SpotifyPlayRequestBaseSchema.extend({
    sourceType: z.literal("context"),
    contextUri: SpotifyPlaylistUriSchema,
  }).strict(),
  SpotifyPlayRequestBaseSchema.extend({
    sourceType: z.literal("queue"),
    uris: z.array(SpotifyTrackUriSchema).min(1).max(SPOTIFY_QUEUE_LIMIT),
  }).strict(),
]);

export type SpotifyPlayRequest = z.infer<typeof SpotifyPlayRequestSchema>;

export type SpotifyPlaybackSource =
  { type: "context"; contextUri: string } | { type: "queue"; uris: string[] };

export function IsSpotifyTrackUri(value: string | undefined): value is string {
  return SpotifyTrackUriSchema.safeParse(value).success;
}

export function GetSpotifyTrackUris(
  tracks: readonly { uri?: string; is_local: boolean }[],
): string[] {
  const seen = new Set<string>();
  const uris: string[] = [];

  for (const track of tracks) {
    if (!track.is_local && IsSpotifyTrackUri(track.uri) && !seen.has(track.uri)) {
      seen.add(track.uri);
      uris.push(track.uri);
    }
  }

  return uris.slice(0, SPOTIFY_QUEUE_LIMIT);
}

export function BuildSpotifyQueue(uris: readonly string[], selectedUri: string): string[] {
  if (!IsSpotifyTrackUri(selectedUri)) {
    return [];
  }

  const seen = new Set<string>();
  const playableUris: string[] = [];

  for (const uri of uris) {
    if (IsSpotifyTrackUri(uri) && !seen.has(uri)) {
      seen.add(uri);
      playableUris.push(uri);
    }
  }

  const selectedIndex = playableUris.indexOf(selectedUri);

  if (selectedIndex < 0) {
    return [];
  }

  return [...playableUris.slice(selectedIndex), ...playableUris.slice(0, selectedIndex)].slice(
    0,
    SPOTIFY_QUEUE_LIMIT,
  );
}
