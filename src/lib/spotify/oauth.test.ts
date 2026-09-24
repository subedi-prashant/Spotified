import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  BuildSpotifyAuthorizationUrl,
  ExchangeAuthorizationCode,
  HasSpotifyScopes,
  RefreshSpotifyAccessToken,
  SPOTIFY_PLAYBACK_SCOPES,
  SPOTIFY_SCOPES,
  SpotifyTokenError,
} from "@/lib/spotify/oauth";

function TokenResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("Spotify OAuth", () => {
  beforeEach(() => {
    process.env.SPOTIFY_CLIENT_ID = "client-id";
    process.env.SPOTIFY_CLIENT_SECRET = "client-secret";
    process.env.SPOTIFY_REDIRECT_URI = "http://127.0.0.1:3000/api/auth/spotify/callback";
  });

  it("builds an authorization request with every required read and playback scope", () => {
    const url = new URL(BuildSpotifyAuthorizationUrl("opaque-state"));

    expect(url.origin).toBe("https://accounts.spotify.com");
    expect(url.searchParams.get("state")).toBe("opaque-state");
    expect(url.searchParams.get("redirect_uri")).toBe(
      "http://127.0.0.1:3000/api/auth/spotify/callback",
    );
    expect(url.searchParams.get("scope")?.split(" ").sort()).toEqual([...SPOTIFY_SCOPES].sort());
    expect(SPOTIFY_PLAYBACK_SCOPES).toEqual([
      "streaming",
      "user-modify-playback-state",
      "user-read-email",
      "user-read-private",
    ]);
  });

  it("detects legacy grants that are missing playback scopes", () => {
    const legacyScopes = SPOTIFY_SCOPES.filter(
      (scope) =>
        !SPOTIFY_PLAYBACK_SCOPES.includes(scope as (typeof SPOTIFY_PLAYBACK_SCOPES)[number]),
    );

    expect(HasSpotifyScopes(SPOTIFY_SCOPES)).toBe(true);
    expect(HasSpotifyScopes(legacyScopes)).toBe(false);
    expect(HasSpotifyScopes(["streaming"], SPOTIFY_PLAYBACK_SCOPES)).toBe(false);
  });

  it("exchanges the code only from the server with basic client authentication", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () =>
      TokenResponse({
        access_token: "access-token",
        token_type: "Bearer",
        expires_in: 3600,
        refresh_token: "refresh-token",
        scope: SPOTIFY_SCOPES.join(" "),
      }),
    );

    await ExchangeAuthorizationCode("authorization-code", fetchMock);

    const [input, init] = fetchMock.mock.calls[0] ?? [];
    const body = new URLSearchParams(String(init?.body));
    expect(String(input)).toBe("https://accounts.spotify.com/api/token");
    expect(new Headers(init?.headers).get("authorization")).toBe(
      `Basic ${Buffer.from("client-id:client-secret").toString("base64")}`,
    );
    expect(body.get("grant_type")).toBe("authorization_code");
    expect(body.get("code")).toBe("authorization-code");
  });

  it("identifies an expired or revoked refresh token without retrying it", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () =>
      TokenResponse({ error: "invalid_grant", error_description: "Expired" }, 400),
    );

    const error = await RefreshSpotifyAccessToken("expired-token", fetchMock).catch(
      (caught: unknown) => caught,
    );

    expect(error).toBeInstanceOf(SpotifyTokenError);
    expect(error).toMatchObject({ errorCode: "invalid_grant", status: 400 });
    expect((error as SpotifyTokenError).IsInvalidGrant()).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
