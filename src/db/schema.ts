import { sql } from "drizzle-orm";
import { check, index, integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const SpotifyAccountStatus = pgEnum("spotify_account_status", [
  "connected",
  "reconnect_required",
]);

export const Users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const SpotifyAccounts = pgTable(
  "spotify_accounts",
  {
    userId: uuid("user_id")
      .primaryKey()
      .references(() => Users.id, { onDelete: "cascade" }),
    spotifyAccountId: text("spotify_account_id").notNull().unique(),
    spotifyUserId: text("spotify_user_id"),
    encryptedAccessToken: text("encrypted_access_token"),
    accessExpiresAt: timestamp("access_expires_at", { withTimezone: true }),
    encryptedRefreshToken: text("encrypted_refresh_token"),
    authorizedAt: timestamp("authorized_at", { withTimezone: true }).notNull(),
    grantedScopes: text("granted_scopes")
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    status: SpotifyAccountStatus("status").notNull().default("connected"),
    tokenVersion: integer("token_version").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check(
      "spotify_accounts_connected_tokens_check",
      sql`${table.status} <> 'connected' OR (${table.encryptedAccessToken} IS NOT NULL AND ${table.accessExpiresAt} IS NOT NULL AND ${table.encryptedRefreshToken} IS NOT NULL)`,
    ),
    index("spotify_accounts_status_idx").on(table.status),
  ],
);

export const Sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => Users.id, { onDelete: "cascade" }),
    sessionHash: text("session_hash").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    index("sessions_user_id_idx").on(table.userId),
    index("sessions_expires_at_idx").on(table.expiresAt),
  ],
);

export type SpotifyAccountRecord = typeof SpotifyAccounts.$inferSelect;
