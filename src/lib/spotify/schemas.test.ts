import { describe, expect, it } from "vitest";

import {
  SpotifyPlaylistSchema,
  SpotifyProfileSchema,
  SpotifyTrackSchema,
} from "@/lib/spotify/schemas";

const TRACK = {
  id: "track-id",
  name: "A Track",
  album: {
    id: "album-id",
    name: "An Album",
    artists: [],
    external_urls: { spotify: "https://open.spotify.com/album/album-id" },
    images: [],
    release_date: "2026",
    uri: "spotify:album:album-id",
    type: "album",
  },
  artists: [
    {
      id: "artist-id",
      name: "An Artist",
      external_urls: { spotify: "https://open.spotify.com/artist/artist-id" },
      uri: "spotify:artist:artist-id",
      type: "artist",
    },
  ],
  duration_ms: 203000,
  external_urls: { spotify: "https://open.spotify.com/track/track-id" },
  is_local: false,
  uri: "spotify:track:track-id",
  type: "track",
};

describe("Spotify response validation", () => {
  it("accepts current track payloads without removed popularity fields", () => {
    const result = SpotifyTrackSchema.parse(TRACK);
    expect(result.name).toBe("A Track");
    expect("popularity" in result).toBe(false);
  });

  it("requires the immutable account id for account linking", () => {
    const profileWithoutAccountId = {
      id: "changeable-id",
      display_name: "Listener",
      external_urls: {},
      images: [],
      type: "user",
      uri: "spotify:user:listener",
    };

    expect(SpotifyProfileSchema.safeParse(profileWithoutAccountId).success).toBe(false);
  });

  it("allows followed playlist metadata without an items object", () => {
    const result = SpotifyPlaylistSchema.parse({
      id: "playlist-id",
      name: "A followed playlist",
      collaborative: false,
      description: null,
      external_urls: { spotify: "https://open.spotify.com/playlist/playlist-id" },
      images: [],
      owner: { id: "another-user", display_name: "Another user", external_urls: {} },
      public: true,
      snapshot_id: "snapshot",
      type: "playlist",
      uri: "spotify:playlist:playlist-id",
    });

    expect(result.items).toBeUndefined();
  });
});
