import { describe, expect, it, vi } from "vitest";

import {
  SpotifyApiError,
  SpotifyClient,
  SpotifyResponseValidationError,
} from "@/lib/spotify/client";

const PROFILE_RESPONSE = {
  account_id: "stable-account-id",
  id: "changeable-user-id",
  display_name: "Atlas Listener",
  external_urls: { spotify: "https://open.spotify.com/user/example" },
  images: [],
  type: "user",
  uri: "spotify:user:example",
};

function JsonResponse(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
    ...init,
  });
}

describe("SpotifyClient", () => {
  it("sends a server-held bearer token and validates the profile", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => JsonResponse(PROFILE_RESPONSE));
    const client = new SpotifyClient("private-access-token", fetchMock, "https://api.example/v1/");

    await expect(client.GetProfile()).resolves.toMatchObject({
      account_id: "stable-account-id",
      display_name: "Atlas Listener",
    });

    const [input, init] = fetchMock.mock.calls[0] ?? [];
    expect(String(input)).toBe("https://api.example/v1/me");
    expect(new Headers(init?.headers).get("authorization")).toBe("Bearer private-access-token");
    expect(init?.cache).toBe("no-store");
  });

  it("uses the current playlist items route instead of the removed tracks route", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () =>
      JsonResponse({ limit: 50, next: null, offset: 0, previous: null, total: 0, items: [] }),
    );
    const client = new SpotifyClient("token", fetchMock, "https://api.example/v1/");

    await client.GetPlaylistItems("playlist/id");

    const [input] = fetchMock.mock.calls[0] ?? [];
    const url = new URL(String(input));
    expect(url.pathname).toBe("/v1/playlists/playlist%2Fid/items");
    expect(url.pathname).not.toContain("/tracks");
    expect(url.searchParams.get("additional_types")).toBe("track,episode");
  });

  it("caps catalog search at Spotify's ten-result limit", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => JsonResponse({}));
    const client = new SpotifyClient("token", fetchMock, "https://api.example/v1/");

    await client.Search("Portishead", 50);

    const [input] = fetchMock.mock.calls[0] ?? [];
    const url = new URL(String(input));
    expect(url.searchParams.get("limit")).toBe("10");
    expect(url.searchParams.get("type")).toBe("artist,track");
  });

  it("distinguishes development quota exhaustion from a normal rate limit", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () =>
      JsonResponse(
        {
          error: {
            status: 429,
            message: "Too many requests",
            reason: "QUOTA_EXCEEDED",
          },
        },
        { status: 429, headers: { "retry-after": "42" } },
      ),
    );
    const client = new SpotifyClient("token", fetchMock, "https://api.example/v1/");

    const error = await client.GetProfile().catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(SpotifyApiError);
    expect(error).toMatchObject({
      status: 429,
      reason: "QUOTA_EXCEEDED",
      retryAfterSeconds: 42,
    });
  });

  it("refuses to display malformed provider data", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => JsonResponse({ id: "missing-account-id" }));
    const client = new SpotifyClient("token", fetchMock, "https://api.example/v1/");

    await expect(client.GetProfile()).rejects.toBeInstanceOf(SpotifyResponseValidationError);
  });
});
