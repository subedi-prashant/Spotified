import { z } from "zod";

import { GetSpotifyCredentials } from "@/lib/env";

const AUTHORIZE_URL = "https://accounts.spotify.com/authorize";
const TOKEN_URL = "https://accounts.spotify.com/api/token";

export const SPOTIFY_STATE_COOKIE = "music_atlas_spotify_state";
export const SPOTIFY_SCOPES = [
  "playlist-read-collaborative",
  "playlist-read-private",
  "user-library-read",
  "user-read-recently-played",
  "user-top-read",
] as const;

const TokenResponseSchema = z
  .object({
    access_token: z.string().min(1),
    token_type: z.literal("Bearer"),
    expires_in: z.number().int().positive(),
    refresh_token: z.string().min(1).optional(),
    scope: z.string().default(""),
  })
  .passthrough();

export type SpotifyTokenResponse = z.infer<typeof TokenResponseSchema>;

export class SpotifyTokenError extends Error {
  public readonly errorCode: string;
  public readonly status: number;

  public constructor(errorCode: string, status: number) {
    super("Spotify authorization could not be completed.");
    this.name = "SpotifyTokenError";
    this.errorCode = errorCode;
    this.status = status;
  }

  public IsInvalidGrant(): boolean {
    return this.errorCode === "invalid_grant";
  }
}

export function BuildSpotifyAuthorizationUrl(state: string): string {
  const credentials = GetSpotifyCredentials();
  const url = new URL(AUTHORIZE_URL);
  url.searchParams.set("client_id", credentials.clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", credentials.redirectUri);
  url.searchParams.set("scope", SPOTIFY_SCOPES.join(" "));
  url.searchParams.set("state", state);
  url.searchParams.set("show_dialog", "true");
  return url.toString();
}

export async function ExchangeAuthorizationCode(
  code: string,
  fetchImplementation: typeof fetch = fetch,
): Promise<SpotifyTokenResponse> {
  const credentials = GetSpotifyCredentials();
  return RequestToken(
    {
      grant_type: "authorization_code",
      code,
      redirect_uri: credentials.redirectUri,
    },
    fetchImplementation,
  );
}

export async function RefreshSpotifyAccessToken(
  refreshToken: string,
  fetchImplementation: typeof fetch = fetch,
): Promise<SpotifyTokenResponse> {
  return RequestToken(
    {
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    },
    fetchImplementation,
  );
}

async function RequestToken(
  parameters: Record<string, string>,
  fetchImplementation: typeof fetch,
): Promise<SpotifyTokenResponse> {
  const credentials = GetSpotifyCredentials();
  const authorization = Buffer.from(
    `${credentials.clientId}:${credentials.clientSecret}`,
    "utf8",
  ).toString("base64");
  const response = await fetchImplementation(TOKEN_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${authorization}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(parameters),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  const body = await ReadJson(response);

  if (!response.ok) {
    const errorCode =
      typeof body === "object" && body !== null && "error" in body && typeof body.error === "string"
        ? body.error
        : "token_request_failed";
    throw new SpotifyTokenError(errorCode, response.status);
  }

  const result = TokenResponseSchema.safeParse(body);

  if (!result.success) {
    throw new SpotifyTokenError("invalid_token_response", response.status);
  }

  return result.data;
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
