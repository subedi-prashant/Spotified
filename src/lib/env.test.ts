import { beforeEach, describe, expect, it } from "vitest";

import {
  ConfigurationError,
  GetAppBaseUrl,
  GetDatabaseUrl,
  GetSpotifyCredentials,
} from "@/lib/env";

describe("server environment validation", () => {
  beforeEach(() => {
    process.env.APP_BASE_URL = "http://127.0.0.1:3000";
    process.env.DATABASE_URL =
      "postgresql://postgres.project:password@region.pooler.supabase.com:6543/postgres";
    process.env.SPOTIFY_CLIENT_ID = "client-id";
    process.env.SPOTIFY_CLIENT_SECRET = "client-secret";
    process.env.SPOTIFY_REDIRECT_URI = "http://127.0.0.1:3000/api/auth/spotify/callback";
  });

  it("accepts PostgreSQL and HTTP application URLs", () => {
    expect(GetDatabaseUrl().startsWith("postgresql://")).toBe(true);
    expect(GetAppBaseUrl()).toBe("http://127.0.0.1:3000");
    expect(GetSpotifyCredentials().redirectUri).toBe(
      "http://127.0.0.1:3000/api/auth/spotify/callback",
    );
  });

  it("rejects a non-PostgreSQL database URL", () => {
    process.env.DATABASE_URL = "https://example.com/database";
    expect(() => GetDatabaseUrl()).toThrow(ConfigurationError);
  });

  it("rejects a non-HTTP application origin", () => {
    process.env.APP_BASE_URL = "ftp://example.com";
    expect(() => GetAppBaseUrl()).toThrow(ConfigurationError);
  });
});
