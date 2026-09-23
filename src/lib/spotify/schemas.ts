import { z } from "zod";

const ExternalUrlsSchema = z
  .object({
    spotify: z.string().optional(),
  })
  .passthrough();

export const SpotifyImageSchema = z
  .object({
    url: z.url(),
    height: z.number().int().nullable().optional(),
    width: z.number().int().nullable().optional(),
  })
  .passthrough();

export const SpotifyProfileSchema = z
  .object({
    account_id: z.string().min(1),
    id: z.string().min(1),
    display_name: z.string().nullable(),
    external_urls: ExternalUrlsSchema,
    images: z.array(SpotifyImageSchema).default([]),
    type: z.literal("user"),
    uri: z.string().min(1),
  })
  .passthrough();

export const SpotifySimpleArtistSchema = z
  .object({
    id: z.string().nullable().optional(),
    name: z.string().min(1),
    external_urls: ExternalUrlsSchema.default({}),
    uri: z.string().optional(),
    type: z.literal("artist").optional(),
  })
  .passthrough();

export const SpotifyArtistSchema = SpotifySimpleArtistSchema.extend({
  id: z.string().min(1),
  genres: z.array(z.string()).default([]),
  images: z.array(SpotifyImageSchema).default([]),
  uri: z.string().min(1),
  type: z.literal("artist"),
}).passthrough();

export const SpotifyAlbumSchema = z
  .object({
    id: z.string().nullable().optional(),
    name: z.string().min(1),
    album_type: z.string().optional(),
    artists: z.array(SpotifySimpleArtistSchema).default([]),
    external_urls: ExternalUrlsSchema.default({}),
    images: z.array(SpotifyImageSchema).default([]),
    release_date: z.string().optional(),
    uri: z.string().optional(),
    type: z.literal("album").optional(),
  })
  .passthrough();

export const SpotifyTrackSchema = z
  .object({
    id: z.string().nullable().optional(),
    name: z.string().min(1),
    album: SpotifyAlbumSchema,
    artists: z.array(SpotifySimpleArtistSchema).default([]),
    duration_ms: z.number().int().nonnegative(),
    explicit: z.boolean().optional(),
    external_urls: ExternalUrlsSchema.default({}),
    is_local: z.boolean().default(false),
    uri: z.string().optional(),
    type: z.literal("track"),
  })
  .passthrough();

export const SpotifyEpisodeSchema = z
  .object({
    id: z.string().nullable().optional(),
    name: z.string().min(1),
    description: z.string().optional(),
    duration_ms: z.number().int().nonnegative(),
    explicit: z.boolean().optional(),
    external_urls: ExternalUrlsSchema.default({}),
    images: z.array(SpotifyImageSchema).default([]),
    uri: z.string().optional(),
    type: z.literal("episode"),
  })
  .passthrough();

export const SpotifyPlayableItemSchema = z.discriminatedUnion("type", [
  SpotifyTrackSchema,
  SpotifyEpisodeSchema,
]);

const PageBaseSchema = z.object({
  href: z.string().optional(),
  limit: z.number().int().nonnegative(),
  next: z.string().nullable(),
  offset: z.number().int().nonnegative(),
  previous: z.string().nullable().optional(),
  total: z.number().int().nonnegative(),
});

export const SpotifyTopArtistsPageSchema = PageBaseSchema.extend({
  items: z.array(SpotifyArtistSchema),
}).passthrough();

export const SpotifyTopTracksPageSchema = PageBaseSchema.extend({
  items: z.array(SpotifyTrackSchema),
}).passthrough();

export const SpotifyPlaylistSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    collaborative: z.boolean(),
    description: z.string().nullable().default(null),
    external_urls: ExternalUrlsSchema.default({}),
    images: z.array(SpotifyImageSchema).default([]),
    owner: z
      .object({
        id: z.string().optional(),
        display_name: z.string().nullable().optional(),
        external_urls: ExternalUrlsSchema.default({}),
      })
      .passthrough(),
    public: z.boolean().nullable(),
    snapshot_id: z.string().min(1),
    items: z
      .object({
        href: z.string().optional(),
        total: z.number().int().nonnegative(),
      })
      .passthrough()
      .optional(),
    type: z.literal("playlist"),
    uri: z.string().min(1),
  })
  .passthrough();

export const SpotifyPlaylistsPageSchema = PageBaseSchema.extend({
  items: z.array(SpotifyPlaylistSchema),
}).passthrough();

export const SpotifyPlaylistItemsPageSchema = PageBaseSchema.extend({
  items: z.array(
    z
      .object({
        added_at: z.string().nullable().optional(),
        is_local: z.boolean().default(false),
        item: SpotifyPlayableItemSchema.nullable(),
      })
      .passthrough(),
  ),
}).passthrough();

export const SpotifySavedTracksPageSchema = PageBaseSchema.extend({
  items: z.array(
    z
      .object({
        added_at: z.string(),
        track: SpotifyTrackSchema,
      })
      .passthrough(),
  ),
}).passthrough();

export const SpotifyRecentlyPlayedSchema = z
  .object({
    href: z.string().optional(),
    limit: z.number().int().nonnegative(),
    next: z.string().nullable(),
    cursors: z
      .object({
        after: z.string().optional(),
        before: z.string().optional(),
      })
      .passthrough(),
    items: z.array(
      z
        .object({
          played_at: z.string(),
          track: SpotifyTrackSchema,
        })
        .passthrough(),
    ),
  })
  .passthrough();

export const SpotifySearchSchema = z
  .object({
    artists: SpotifyTopArtistsPageSchema.optional(),
    tracks: SpotifyTopTracksPageSchema.optional(),
  })
  .passthrough();

export type SpotifyProfile = z.infer<typeof SpotifyProfileSchema>;
export type SpotifyArtist = z.infer<typeof SpotifyArtistSchema>;
export type SpotifyTrack = z.infer<typeof SpotifyTrackSchema>;
export type SpotifyPlaylist = z.infer<typeof SpotifyPlaylistSchema>;
export type SpotifyPlayableItem = z.infer<typeof SpotifyPlayableItemSchema>;
export type SpotifyTopArtistsPage = z.infer<typeof SpotifyTopArtistsPageSchema>;
export type SpotifyTopTracksPage = z.infer<typeof SpotifyTopTracksPageSchema>;
export type SpotifyPlaylistsPage = z.infer<typeof SpotifyPlaylistsPageSchema>;
export type SpotifyPlaylistItemsPage = z.infer<typeof SpotifyPlaylistItemsPageSchema>;
export type SpotifySavedTracksPage = z.infer<typeof SpotifySavedTracksPageSchema>;
export type SpotifyRecentlyPlayed = z.infer<typeof SpotifyRecentlyPlayedSchema>;
export type SpotifySearch = z.infer<typeof SpotifySearchSchema>;
