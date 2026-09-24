import type { z } from "zod";

import {
  SpotifyPlaylistItemsPageSchema,
  SpotifyPlaylistSchema,
  SpotifyPlaylistsPageSchema,
  SpotifyProfileSchema,
  SpotifyRecentlyPlayedSchema,
  SpotifySavedTracksPageSchema,
  SpotifySearchSchema,
  SpotifyTopArtistsPageSchema,
  SpotifyTopTracksPageSchema,
  type SpotifyPlaylist,
  type SpotifyPlaylistItemsPage,
  type SpotifyPlaylistsPage,
  type SpotifyProfile,
  type SpotifyRecentlyPlayed,
  type SpotifySavedTracksPage,
  type SpotifySearch,
  type SpotifyTopArtistsPage,
  type SpotifyTopTracksPage,
} from "@/lib/spotify/schemas";

const API_URL = "https://api.spotify.com/v1/";

export type SpotifyTimeRange = "short_term" | "medium_term" | "long_term";

export type SpotifyStartPlaybackCommand =
  | { deviceId: string; contextUri: string; offsetUri: string }
  | { deviceId: string; uris: readonly string[] };

export class SpotifyApiError extends Error {
  public readonly status: number;
  public readonly reason: string | null;
  public readonly retryAfterSeconds: number | null;

  public constructor(status: number, reason: string | null, retryAfterSeconds: number | null) {
    super("Spotify could not complete the request.");
    this.name = "SpotifyApiError";
    this.status = status;
    this.reason = reason;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class SpotifyResponseValidationError extends Error {
  public constructor() {
    super("Spotify returned an unexpected response.");
    this.name = "SpotifyResponseValidationError";
  }
}

export class SpotifyClient {
  private readonly accessToken: string;
  private readonly fetchImplementation: typeof fetch;
  private readonly baseUrl: string;

  public constructor(
    accessToken: string,
    fetchImplementation: typeof fetch = fetch,
    baseUrl = API_URL,
  ) {
    this.accessToken = accessToken;
    this.fetchImplementation = fetchImplementation;
    this.baseUrl = baseUrl;
  }

  public GetProfile(): Promise<SpotifyProfile> {
    return this.request("me", SpotifyProfileSchema);
  }

  public GetTopArtists(timeRange: SpotifyTimeRange, limit = 12): Promise<SpotifyTopArtistsPage> {
    return this.request("me/top/artists", SpotifyTopArtistsPageSchema, {
      time_range: timeRange,
      limit: String(limit),
    });
  }

  public GetTopTracks(timeRange: SpotifyTimeRange, limit = 12): Promise<SpotifyTopTracksPage> {
    return this.request("me/top/tracks", SpotifyTopTracksPageSchema, {
      time_range: timeRange,
      limit: String(limit),
    });
  }

  public GetPlaylists(limit = 50, offset = 0): Promise<SpotifyPlaylistsPage> {
    return this.request("me/playlists", SpotifyPlaylistsPageSchema, {
      limit: String(limit),
      offset: String(offset),
    });
  }

  public GetPlaylist(playlistId: string): Promise<SpotifyPlaylist> {
    return this.request(`playlists/${encodeURIComponent(playlistId)}`, SpotifyPlaylistSchema);
  }

  public GetPlaylistItems(
    playlistId: string,
    limit = 50,
    offset = 0,
  ): Promise<SpotifyPlaylistItemsPage> {
    return this.request(
      `playlists/${encodeURIComponent(playlistId)}/items`,
      SpotifyPlaylistItemsPageSchema,
      {
        limit: String(limit),
        offset: String(offset),
        additional_types: "track,episode",
      },
    );
  }

  public GetSavedTracks(limit = 25, offset = 0): Promise<SpotifySavedTracksPage> {
    return this.request("me/tracks", SpotifySavedTracksPageSchema, {
      limit: String(limit),
      offset: String(offset),
    });
  }

  public GetRecentlyPlayed(limit = 30): Promise<SpotifyRecentlyPlayed> {
    return this.request("me/player/recently-played", SpotifyRecentlyPlayedSchema, {
      limit: String(limit),
    });
  }

  public Search(query: string, limit = 10): Promise<SpotifySearch> {
    return this.request("search", SpotifySearchSchema, {
      q: query,
      type: "artist,track",
      limit: String(Math.min(limit, 10)),
    });
  }

  public StartPlayback(command: SpotifyStartPlaybackCommand): Promise<void> {
    const body =
      "contextUri" in command
        ? { context_uri: command.contextUri, offset: { uri: command.offsetUri } }
        : { uris: command.uris };

    return this.command("me/player/play", { device_id: command.deviceId }, body);
  }

  private async request<TSchema extends z.ZodType>(
    path: string,
    schema: TSchema,
    parameters?: Record<string, string>,
  ): Promise<z.infer<TSchema>> {
    const url = new URL(path, this.baseUrl);

    for (const [name, value] of Object.entries(parameters ?? {})) {
      url.searchParams.set(name, value);
    }

    const response = await this.fetchImplementation(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${this.accessToken}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    const body = await ReadJson(response);

    if (!response.ok) {
      throw CreateApiError(response, body);
    }

    const result = schema.safeParse(body);

    if (!result.success) {
      throw new SpotifyResponseValidationError();
    }

    return result.data;
  }

  private async command(
    path: string,
    parameters: Record<string, string>,
    body: unknown,
  ): Promise<void> {
    const url = new URL(path, this.baseUrl);

    for (const [name, value] of Object.entries(parameters)) {
      url.searchParams.set(name, value);
    }

    const response = await this.fetchImplementation(url, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      throw CreateApiError(response, await ReadJson(response));
    }
  }
}

function CreateApiError(response: Response, body: unknown): SpotifyApiError {
  const retryAfterHeader = response.headers.get("retry-after");
  const retryAfter = retryAfterHeader ? Number.parseInt(retryAfterHeader, 10) : Number.NaN;
  let reason: string | null = null;

  if (typeof body === "object" && body !== null && "error" in body) {
    const error = body.error;

    if (typeof error === "object" && error !== null && "reason" in error) {
      reason = typeof error.reason === "string" ? error.reason : null;
    }
  }

  return new SpotifyApiError(
    response.status,
    reason,
    Number.isFinite(retryAfter) ? retryAfter : null,
  );
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
