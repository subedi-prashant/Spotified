import "server-only";

import { eq, sql } from "drizzle-orm";

import { GetDatabase } from "@/db/client";
import { Sessions, SpotifyAccounts, Users } from "@/db/schema";
import { DecryptSecret, EncryptSecret } from "@/lib/auth/crypto";
import { GetTokenEncryptionKey } from "@/lib/env";
import { SpotifyApiError, SpotifyClient } from "@/lib/spotify/client";
import {
  RefreshSpotifyAccessToken,
  SPOTIFY_SCOPES,
  SpotifyTokenError,
  type SpotifyTokenResponse,
} from "@/lib/spotify/oauth";
import type { SpotifyProfile } from "@/lib/spotify/schemas";

const EXPIRY_BUFFER_MILLISECONDS = 60_000;

export class SpotifyReconnectRequiredError extends Error {
  public constructor() {
    super("Reconnect Spotify to continue.");
    this.name = "SpotifyReconnectRequiredError";
  }
}

export class SpotifyAccountNotFoundError extends Error {
  public constructor() {
    super("No Spotify account is connected.");
    this.name = "SpotifyAccountNotFoundError";
  }
}

export async function ConnectSpotifyAccount(
  profile: SpotifyProfile,
  tokens: SpotifyTokenResponse,
): Promise<string> {
  if (!tokens.refresh_token) {
    throw new SpotifyTokenError("missing_refresh_token", 502);
  }

  const database = GetDatabase();
  const encryptionKey = GetTokenEncryptionKey();
  const authorizedAt = new Date();
  const accessExpiresAt = new Date(authorizedAt.getTime() + tokens.expires_in * 1000);
  const encryptedAccessToken = EncryptSecret(tokens.access_token, encryptionKey);
  const encryptedRefreshToken = EncryptSecret(tokens.refresh_token, encryptionKey);
  const grantedScopes = ParseScopes(tokens.scope);

  return database.transaction(async (transaction) => {
    const [existingAccount] = await transaction
      .select({ userId: SpotifyAccounts.userId })
      .from(SpotifyAccounts)
      .where(eq(SpotifyAccounts.spotifyAccountId, profile.account_id))
      .limit(1);

    if (existingAccount) {
      await transaction
        .update(SpotifyAccounts)
        .set({
          spotifyUserId: profile.id,
          encryptedAccessToken,
          accessExpiresAt,
          encryptedRefreshToken,
          authorizedAt,
          grantedScopes,
          status: "connected",
          tokenVersion: sql`${SpotifyAccounts.tokenVersion} + 1`,
          updatedAt: authorizedAt,
        })
        .where(eq(SpotifyAccounts.userId, existingAccount.userId));
      await transaction.delete(Sessions).where(eq(Sessions.userId, existingAccount.userId));
      await transaction
        .update(Users)
        .set({ updatedAt: authorizedAt })
        .where(eq(Users.id, existingAccount.userId));
      return existingAccount.userId;
    }

    const [user] = await transaction.insert(Users).values({}).returning({ id: Users.id });

    if (!user) {
      throw new Error("Could not create the local user.");
    }

    await transaction.insert(SpotifyAccounts).values({
      userId: user.id,
      spotifyAccountId: profile.account_id,
      spotifyUserId: profile.id,
      encryptedAccessToken,
      accessExpiresAt,
      encryptedRefreshToken,
      authorizedAt,
      grantedScopes,
      status: "connected",
    });

    return user.id;
  });
}

export async function GetSpotifyAccessToken(userId: string, forceRefresh = false): Promise<string> {
  const database = GetDatabase();
  const encryptionKey = GetTokenEncryptionKey();

  return database.transaction(async (transaction) => {
    await transaction.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${userId}))`);
    const [account] = await transaction
      .select()
      .from(SpotifyAccounts)
      .where(eq(SpotifyAccounts.userId, userId))
      .limit(1);

    if (!account) {
      throw new SpotifyAccountNotFoundError();
    }

    if (
      account.status !== "connected" ||
      !account.encryptedAccessToken ||
      !account.encryptedRefreshToken ||
      !account.accessExpiresAt
    ) {
      throw new SpotifyReconnectRequiredError();
    }

    if (
      !forceRefresh &&
      account.accessExpiresAt.getTime() > Date.now() + EXPIRY_BUFFER_MILLISECONDS
    ) {
      return DecryptSecret(account.encryptedAccessToken, encryptionKey);
    }

    try {
      const refreshedTokens = await RefreshSpotifyAccessToken(
        DecryptSecret(account.encryptedRefreshToken, encryptionKey),
      );
      const refreshedAt = new Date();
      const accessExpiresAt = new Date(refreshedAt.getTime() + refreshedTokens.expires_in * 1000);

      await transaction
        .update(SpotifyAccounts)
        .set({
          encryptedAccessToken: EncryptSecret(refreshedTokens.access_token, encryptionKey),
          accessExpiresAt,
          encryptedRefreshToken: refreshedTokens.refresh_token
            ? EncryptSecret(refreshedTokens.refresh_token, encryptionKey)
            : account.encryptedRefreshToken,
          grantedScopes:
            refreshedTokens.scope.trim().length > 0
              ? ParseScopes(refreshedTokens.scope)
              : account.grantedScopes,
          status: "connected",
          tokenVersion: account.tokenVersion + 1,
          updatedAt: refreshedAt,
        })
        .where(eq(SpotifyAccounts.userId, userId));

      return refreshedTokens.access_token;
    } catch (error) {
      if (error instanceof SpotifyTokenError && error.IsInvalidGrant()) {
        await transaction
          .update(SpotifyAccounts)
          .set({
            encryptedAccessToken: null,
            accessExpiresAt: null,
            encryptedRefreshToken: null,
            status: "reconnect_required",
            tokenVersion: account.tokenVersion + 1,
            updatedAt: new Date(),
          })
          .where(eq(SpotifyAccounts.userId, userId));
        throw new SpotifyReconnectRequiredError();
      }

      throw error;
    }
  });
}

export async function RunSpotifyOperation<TResult>(
  userId: string,
  operation: (client: SpotifyClient) => Promise<TResult>,
): Promise<TResult> {
  const accessToken = await GetSpotifyAccessToken(userId);

  try {
    return await operation(new SpotifyClient(accessToken));
  } catch (error) {
    if (error instanceof SpotifyApiError && error.status === 401) {
      const refreshedAccessToken = await GetSpotifyAccessToken(userId, true);
      return operation(new SpotifyClient(refreshedAccessToken));
    }

    throw error;
  }
}

export async function DisconnectSpotifyAccount(userId: string): Promise<void> {
  await GetDatabase().delete(Users).where(eq(Users.id, userId));
}

export async function GetSpotifyConnectionStatus(
  userId: string,
): Promise<"connected" | "reconnect_required" | "missing"> {
  const [account] = await GetDatabase()
    .select({ status: SpotifyAccounts.status })
    .from(SpotifyAccounts)
    .where(eq(SpotifyAccounts.userId, userId))
    .limit(1);

  return account?.status ?? "missing";
}

function ParseScopes(scope: string): string[] {
  const scopes = scope.split(/\s+/).filter(Boolean);
  return [...new Set(scopes.length > 0 ? scopes : SPOTIFY_SCOPES)].sort();
}
