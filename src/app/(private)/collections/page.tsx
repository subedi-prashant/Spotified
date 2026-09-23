import type { Metadata } from "next";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { ProviderError } from "@/components/provider-error";
import { SectionHeading } from "@/components/section-heading";
import { PlaylistCard } from "@/components/spotify/playlist-card";
import { SpotifyAttribution } from "@/components/spotify/spotify-attribution";
import { TrackRow } from "@/components/spotify/track-row";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RequireCurrentSession } from "@/lib/auth/session";
import { ParseOffset } from "@/lib/pagination";
import { CaptureSpotifyOperation } from "@/server/services/spotify-page-service";
import { GetSpotifyCollections } from "@/server/services/spotify-service";

export const metadata: Metadata = {
  title: "Collections",
};

const PAGE_SIZE = 24;

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ offset?: string }>;
}) {
  const session = await RequireCurrentSession();
  const parameters = await searchParams;
  const offset = ParseOffset(parameters.offset, 100_000);

  const result = await CaptureSpotifyOperation(() => GetSpotifyCollections(session.userId, offset));

  if (!result.ok) {
    return (
      <div className="space-y-10">
        <PageHeader
          eyebrow="Your Spotify library"
          title="Collections"
          description="Spotified only displays complete, validated responses from Spotify."
        />
        <ProviderError error={result.error} />
      </div>
    );
  }

  const collections = result.data;

  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="Your Spotify library"
        title="Collections, without the clutter"
        description="Playlist metadata and saved tracks are shown as Spotify supplies them. Playlist contents can be opened only when you own or collaborate on that playlist."
        action={<SpotifyAttribution />}
      />

      <section className="space-y-5">
        <SectionHeading
          title="Playlists"
          description={`${collections.playlists.total} playlists returned by Spotify for this account`}
        />
        {collections.playlists.items.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {collections.playlists.items.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No playlists on this page"
            description="Spotify did not return playlist metadata for this position."
          />
        )}
        <Pagination
          path="/collections"
          offset={offset}
          pageSize={PAGE_SIZE}
          total={collections.playlists.total}
        />
      </section>

      <section className="space-y-5">
        <SectionHeading
          title="Saved tracks"
          description={`${collections.savedTracks.total} tracks currently saved in Your Music`}
        />
        <Card>
          <CardHeader className="pb-2">
            <p className="text-xs leading-5 text-muted-foreground">
              Saved tracks are library items, not proof that a song was played.
            </p>
          </CardHeader>
          <CardContent>
            {collections.savedTracks.items.length > 0 ? (
              <div className="grid gap-x-6 lg:grid-cols-2">
                {collections.savedTracks.items.map((item, index) => (
                  <TrackRow
                    key={`${item.added_at}-${item.track.id ?? index}`}
                    track={item.track}
                    trailing={new Intl.DateTimeFormat("en", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }).format(new Date(item.added_at))}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No saved tracks on this page"
                description="Songs you save in Spotify will appear here when the API returns them."
              />
            )}
          </CardContent>
        </Card>
        <Pagination
          path="/collections"
          offset={offset}
          pageSize={PAGE_SIZE}
          total={collections.savedTracks.total}
        />
      </section>
    </div>
  );
}
