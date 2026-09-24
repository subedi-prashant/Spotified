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

  it("starts a URI queue on a specific Web Playback SDK device", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => new Response(null, { status: 204 }));
    const client = new SpotifyClient("private-access-token", fetchMock, "https://api.example/v1/");
    const uris = ["spotify:track:AAAAAAAAAAAAAAAAAAAAAA", "spotify:track:BBBBBBBBBBBBBBBBBBBBBB"];

    await client.StartPlayback({ deviceId: "device123", uris });

    const [input, init] = fetchMock.mock.calls[0] ?? [];
    const url = new URL(String(input));
    expect(url.pathname).toBe("/v1/me/player/play");
    expect(url.searchParams.get("device_id")).toBe("device123");
    expect(init?.method).toBe("PUT");
    expect(init?.cache).toBe("no-store");
    expect(new Headers(init?.headers).get("authorization")).toBe("Bearer private-access-token");
    expect(new Headers(init?.headers).get("content-type")).toBe("application/json");
    expect(JSON.parse(String(init?.body))).toEqual({ uris });
  });

  it("starts a selected song in its Spotify playlist context", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => new Response(null, { status: 204 }));
    const client = new SpotifyClient("token", fetchMock, "https://api.example/v1/");

    await client.StartPlayback({
      deviceId: "device456",
      contextUri: "spotify:playlist:CCCCCCCCCCCCCCCCCCCCCC",
      offsetUri: "spotify:track:DDDDDDDDDDDDDDDDDDDDDD",
    });

    const [, init] = fetchMock.mock.calls[0] ?? [];
    expect(JSON.parse(String(init?.body))).toEqual({
      context_uri: "spotify:playlist:CCCCCCCCCCCCCCCCCCCCCC",
      offset: { uri: "spotify:track:DDDDDDDDDDDDDDDDDDDDDD" },
    });
  });

  it("propagates provider failures from playback commands", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () =>
      JsonResponse({ error: { status: 403, message: "Restricted" } }, { status: 403 }),
    );
    const client = new SpotifyClient("token", fetchMock, "https://api.example/v1/");

    await expect(
      client.StartPlayback({
        deviceId: "device789",
        uris: ["spotify:track:EEEEEEEEEEEEEEEEEEEEEE"],
      }),
    ).rejects.toMatchObject({ status: 403 });
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
