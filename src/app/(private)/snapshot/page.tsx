import type { Metadata } from "next";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { ProviderError } from "@/components/provider-error";
import { SectionHeading } from "@/components/section-heading";
import { ArtistCard } from "@/components/spotify/artist-card";
import { Artwork } from "@/components/spotify/artwork";
import { SpotifyAttribution } from "@/components/spotify/spotify-attribution";
import { TimeRangeTabs } from "@/components/spotify/time-range-tabs";
import { TrackRow } from "@/components/spotify/track-row";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RequireCurrentSession } from "@/lib/auth/session";
import type { SpotifyTimeRange } from "@/lib/spotify/client";
import { FormatRelativeTime } from "@/lib/spotify/format";
import { CaptureSpotifyOperation } from "@/server/services/spotify-page-service";
import { GetSpotifySnapshot } from "@/server/services/spotify-service";

export const metadata: Metadata = {
  title: "Snapshot",
};

export default async function SnapshotPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const session = await RequireCurrentSession();
  const parameters = await searchParams;
  const timeRange = ParseTimeRange(parameters.range);

  const result = await CaptureSpotifyOperation(() => GetSpotifySnapshot(session.userId, timeRange));

  if (!result.ok) {
    return (
      <div className="space-y-10">
        <PageHeader
          eyebrow="Spotify snapshot"
          title="Your music view"
          description="Spotified only displays complete, validated responses from Spotify."
        />
        <ProviderError error={result.error} />
      </div>
    );
  }

  const snapshot = result.data;
  const displayName = snapshot.profile.display_name ?? "listener";

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Spotify snapshot"
        title={`A clear view for ${displayName}`}
        description="These are Spotify-provided affinity rankings and recent-play records. They are not play counts, listening minutes, or app-generated taste scores."
        action={<TimeRangeTabs selected={timeRange} />}
      />

      <section className="grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
        <Card className="overflow-hidden">
          <CardContent className="relative flex h-full min-h-56 flex-col justify-between p-6">
            <div className="absolute -right-12 -top-16 size-52 rounded-full bg-violet-500/15 blur-3xl" />
            <div className="relative flex items-center gap-4">
              <Artwork
                src={snapshot.profile.images[0]?.url}
                alt={`${displayName} profile`}
                kind="artist"
                className="size-16 rounded-2xl"
              />
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold">{displayName}</p>
                <p className="mt-1 text-xs text-muted-foreground">Connected Spotify profile</p>
              </div>
            </div>
            <div className="relative mt-10 space-y-2">
              <p className="text-sm font-semibold">Nothing inferred behind the scenes</p>
              <p className="text-xs leading-5 text-muted-foreground">
                This page presents Spotify’s supplied order and metadata without turning it into
                unsupported precision.
              </p>
              <SpotifyAttribution className="pt-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-end justify-between gap-4 pb-2">
            <SectionHeading
              title="Top artists"
              description="Ranked by Spotify affinity for the selected window"
            />
          </CardHeader>
          <CardContent>
            {snapshot.topArtists.items.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {snapshot.topArtists.items.map((artist, index) => (
                  <ArtistCard key={artist.id} artist={artist} rank={index + 1} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No artist ranking yet"
                description="Spotify may need more listening activity before it can return affinity results for this window."
              />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <SectionHeading
              title="Top tracks"
              description="Spotify affinity order—not a play-count chart"
            />
          </CardHeader>
          <CardContent>
            {snapshot.topTracks.items.length > 0 ? (
              <div className="space-y-0.5">
                {snapshot.topTracks.items.map((track, index) => (
                  <TrackRow
                    key={`${track.id ?? track.uri}-${index}`}
                    track={track}
                    rank={index + 1}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No track ranking yet"
                description="Try another time window or keep listening in Spotify."
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <SectionHeading
              title="Recently played"
              description="The latest items Spotify made available"
            />
          </CardHeader>
          <CardContent>
            {snapshot.recentlyPlayed.items.length > 0 ? (
              <div className="space-y-0.5">
                {snapshot.recentlyPlayed.items.map((item, index) => (
                  <TrackRow
                    key={`${item.played_at}-${item.track.id ?? index}`}
                    track={item.track}
                    trailing={FormatRelativeTime(item.played_at)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Nothing recent to show"
                description="Spotify did not return any recent tracks for this account."
              />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function ParseTimeRange(value: string | undefined): SpotifyTimeRange {
  if (value === "short_term" || value === "long_term") {
    return value;
  }

  return "medium_term";
}
