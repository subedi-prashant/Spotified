import type { Metadata } from "next";
import { Search } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { ProviderError } from "@/components/provider-error";
import { SectionHeading } from "@/components/section-heading";
import { ArtistCard } from "@/components/spotify/artist-card";
import { SpotifyAttribution } from "@/components/spotify/spotify-attribution";
import { TrackRow } from "@/components/spotify/track-row";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RequireCurrentSession } from "@/lib/auth/session";
import { CaptureSpotifyOperation } from "@/server/services/spotify-page-service";
import { SearchSpotify } from "@/server/services/spotify-service";

export const metadata: Metadata = {
  title: "Explore",
};

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await RequireCurrentSession();
  const parameters = await searchParams;
  const query = (parameters.q ?? "").trim().slice(0, 100);

  if (!query) {
    return (
      <div className="space-y-10">
        <ExploreHeader query="" />
        <EmptyState
          title="Search the Spotify catalog"
          description="Find artists or tracks by name. Results are not personalized and do not use a recommendation score."
          action={<Search className="size-4 text-muted-foreground" aria-hidden="true" />}
        />
      </div>
    );
  }

  const result = await CaptureSpotifyOperation(() => SearchSpotify(session.userId, query));

  if (!result.ok) {
    return (
      <div className="space-y-10">
        <ExploreHeader query={query} />
        <ProviderError error={result.error} />
      </div>
    );
  }

  const artists = result.data.artists?.items ?? [];
  const tracks = result.data.tracks?.items ?? [];

  return (
    <div className="space-y-10">
      <ExploreHeader query={query} />
      <section className="space-y-5">
        <SectionHeading title="Artists" description={`Catalog matches for “${query}”`} />
        {artists.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10">
            {artists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No artists found"
            description="Try a different spelling or a broader artist name."
          />
        )}
      </section>
      <section className="space-y-5">
        <SectionHeading title="Tracks" description="Up to 10 results from Spotify search" />
        {tracks.length > 0 ? (
          <Card>
            <CardContent className="grid gap-x-8 p-3 sm:p-5 lg:grid-cols-2">
              {tracks.map((track, index) => (
                <TrackRow key={`${track.id ?? track.uri}-${index}`} track={track} />
              ))}
            </CardContent>
          </Card>
        ) : (
          <EmptyState
            title="No tracks found"
            description="Try another song title or include the artist name."
          />
        )}
      </section>
    </div>
  );
}

function ExploreHeader({ query }: { query: string }) {
  return (
    <div className="space-y-7 border-b border-border/70 pb-8">
      <PageHeader
        eyebrow="Manual catalog search"
        title="Explore without an algorithm"
        description="Search directly. Music Atlas does not calculate a taste match or imply that you have never heard a result."
        action={<SpotifyAttribution />}
      />
      <form className="flex max-w-2xl gap-2" role="search">
        <Input
          name="q"
          defaultValue={query}
          maxLength={100}
          placeholder="Artist or track"
          aria-label="Search Spotify"
          required
        />
        <Button type="submit" className="shrink-0 px-5">
          <Search className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Search</span>
        </Button>
      </form>
    </div>
  );
}
