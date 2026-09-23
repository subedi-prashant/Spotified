import { z } from "zod";

const UrlSchema = z.url();
const NonEmptySchema = z.string().trim().min(1);

export class ConfigurationError extends Error {
  public constructor(name: string) {
    super(`Missing or invalid server configuration: ${name}.`);
    this.name = "ConfigurationError";
  }
}

function ReadRequired(name: string): string {
  const result = NonEmptySchema.safeParse(process.env[name]);

  if (!result.success) {
    throw new ConfigurationError(name);
  }

  return result.data;
}

export function GetDatabaseUrl(): string {
  const value = ReadRequired("DATABASE_URL");
  const result = UrlSchema.safeParse(value);

  if (!result.success) {
    throw new ConfigurationError("DATABASE_URL");
  }

  const protocol = new URL(result.data).protocol;

  if (protocol !== "postgres:" && protocol !== "postgresql:") {
    throw new ConfigurationError("DATABASE_URL");
  }

  return result.data;
}

export function GetAppBaseUrl(): string {
  const value = ReadRequired("APP_BASE_URL");
  const result = UrlSchema.safeParse(value);

  if (!result.success || !isHttpUrl(result.data)) {
    throw new ConfigurationError("APP_BASE_URL");
  }

  return result.data.replace(/\/$/, "");
}

export function GetSpotifyCredentials() {
  const redirectUri = ReadRequired("SPOTIFY_REDIRECT_URI");
  const redirectResult = UrlSchema.safeParse(redirectUri);

  if (!redirectResult.success || !isHttpUrl(redirectResult.data)) {
    throw new ConfigurationError("SPOTIFY_REDIRECT_URI");
  }

  return {
    clientId: ReadRequired("SPOTIFY_CLIENT_ID"),
    clientSecret: ReadRequired("SPOTIFY_CLIENT_SECRET"),
    redirectUri,
  };
}

export function GetTokenEncryptionKey(): string {
  return ReadRequired("TOKEN_ENCRYPTION_KEY");
}

function isHttpUrl(value: string): boolean {
  const protocol = new URL(value).protocol;
  return protocol === "http:" || protocol === "https:";
}
