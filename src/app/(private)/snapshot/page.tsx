import { Fragment } from "react";
import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { ProviderError } from "@/components/provider-error";
import { SectionHeading } from "@/components/section-heading";
import { ArtistCard } from "@/components/spotify/artist-card";
import { Artwork } from "@/components/spotify/artwork";
import { SpotifyPlaybackSourceProvider } from "@/components/spotify/player/playback-source";
import { TrackPlayButton } from "@/components/spotify/player/track-play-button";
import { TimeRangeTabs } from "@/components/spotify/time-range-tabs";
import { TrackRow } from "@/components/spotify/track-row";
import { ButtonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RequireCurrentSession } from "@/lib/auth/session";
import type { SpotifyTimeRange } from "@/lib/spotify/client";
import { FormatDuration, FormatRelativeTime } from "@/lib/spotify/format";
import { GetSpotifyTrackUris, IsSpotifyTrackUri } from "@/lib/spotify/playback";
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
  const leadTrack = snapshot.topTracks.items[0];
  const leadPlaybackUri =
    leadTrack && !leadTrack.is_local && IsSpotifyTrackUri(leadTrack.uri) ? leadTrack.uri : null;

  return (
    <div className="space-y-14">
      <PageHeader
        eyebrow="Spotify snapshot"
        title={`A clear view for ${displayName}`}
        description="These are Spotify-provided affinity rankings and recent-play records. They are not play counts, listening minutes, or app-generated taste scores."
        action={<TimeRangeTabs selected={timeRange} />}
      />

      {leadTrack ? (
        <SpotifyPlaybackSourceProvider
          source={{ type: "queue", uris: GetSpotifyTrackUris(snapshot.topTracks.items) }}
        >
          <section className="grid border border-foreground bg-card lg:grid-cols-[minmax(0,0.9fr)_minmax(24rem,0.75fr)]">
            <div className="flex min-w-0 flex-col bg-secondary p-6 text-white sm:p-8 lg:p-10">
              <div className="flex items-center justify-between gap-4 border-b border-white/35 pb-4">
                <span className="press-label text-white/55">Lead affinity release / Rank 01</span>
                <span className="bg-primary px-2 py-1 text-[0.65rem] font-bold tracking-[0.1em] text-black">
                  SPOTIFY ORDER
                </span>
              </div>

              <div className="flex flex-1 flex-col justify-center py-10">
                {leadTrack.external_urls.spotify ? (
                  <a
                    href={leadTrack.external_urls.spotify}
                    target="_blank"
                    rel="noreferrer"
                    className="group w-fit max-w-full focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary"
                  >
                    <h2 className="text-balance font-display text-[clamp(3rem,7vw,6rem)] font-black uppercase leading-[0.78] tracking-[-0.03em] text-white group-hover:text-primary">
                      {leadTrack.name}
                    </h2>
                  </a>
                ) : (
                  <h2 className="text-balance font-display text-[clamp(3rem,7vw,6rem)] font-black uppercase leading-[0.78] tracking-[-0.03em] text-white">
                    {leadTrack.name}
                  </h2>
                )}

                <div className="mt-7 grid gap-3 border-y border-white/30 py-4 text-xs sm:grid-cols-2">
                  <MetadataItem label="Album">
                    {leadTrack.album.external_urls.spotify ? (
                      <a
                        href={leadTrack.album.external_urls.spotify}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-primary hover:underline"
                      >
                        {leadTrack.album.name}
                      </a>
                    ) : (
                      leadTrack.album.name
                    )}
                  </MetadataItem>
                  <MetadataItem label="Artist">
                    {leadTrack.artists.map((artist, index) => (
                      <Fragment key={`${artist.id ?? artist.name}-${index}`}>
                        {index > 0 ? ", " : null}
                        {artist.external_urls.spotify ? (
                          <a
                            href={artist.external_urls.spotify}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-primary hover:underline"
                          >
                            {artist.name}
                          </a>
                        ) : (
                          artist.name
                        )}
                      </Fragment>
                    ))}
                  </MetadataItem>
                  <MetadataItem label="Released">
                    {leadTrack.album.release_date ?? "Not supplied"}
                  </MetadataItem>
                  <MetadataItem label="Duration">
                    {FormatDuration(leadTrack.duration_ms)}
                    {leadTrack.explicit ? " / Explicit" : ""}
                  </MetadataItem>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {leadPlaybackUri ? (
                  <TrackPlayButton
                    trackUri={leadPlaybackUri}
                    trackName={leadTrack.name}
                    className="press-tag-swing size-13 border-white bg-primary text-black hover:bg-white hover:text-black"
                  />
                ) : null}
                {leadTrack.external_urls.spotify ? (
                  <a
                    href={leadTrack.external_urls.spotify}
                    target="_blank"
                    rel="noreferrer"
                    className={ButtonVariants({ variant: "outline" })}
                  >
                    Open in Spotify
                    <ExternalLink className="size-4" aria-hidden="true" />
                  </a>
                ) : null}
                <span className="ml-auto flex items-center gap-3 border border-white/35 px-3 py-2">
                  <Artwork
                    src={snapshot.profile.images[0]?.url}
                    alt={`${displayName} profile`}
                    kind="artist"
                    className="size-9 border-white/35"
                  />
                  <span>
                    <span className="press-label block text-white/45">Connected profile</span>
                    <span className="mt-1 block text-xs font-semibold">{displayName}</span>
                  </span>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center border-t border-foreground bg-background p-4 sm:p-7 lg:border-l lg:border-t-0">
              <Artwork
                src={leadTrack.album.images[0]?.url}
                alt={`${leadTrack.album.name} cover`}
                className="aspect-square w-full max-w-[42rem]"
              />
            </div>
          </section>
        </SpotifyPlaybackSourceProvider>
      ) : (
        <EmptyState
          title="No lead track available"
          description="Spotify did not return a top-track ranking for this time window."
        />
      )}

      <section className="space-y-5">
        <SectionHeading
          title="Top artists"
          description="Ranked by Spotify affinity for the selected window"
        />
        {snapshot.topArtists.items.length > 0 ? (
          <div className="grid grid-cols-2 gap-px bg-foreground sm:grid-cols-4 lg:grid-cols-8">
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
      </section>

      <section className="grid gap-8 xl:grid-cols-2">
        <div className="space-y-5">
          <SectionHeading
            title="Top tracks"
            description="Spotify affinity order—not a play-count chart"
          />
          <Card>
            <CardHeader className="py-3">
              <p className="text-xs leading-5 text-muted-foreground">
                Rank 01 is the lead release above. The complete supplied order remains playable
                here.
              </p>
            </CardHeader>
            <CardContent className="p-3">
              {snapshot.topTracks.items.length > 0 ? (
                <SpotifyPlaybackSourceProvider
                  source={{ type: "queue", uris: GetSpotifyTrackUris(snapshot.topTracks.items) }}
                >
                  <div>
                    {snapshot.topTracks.items.map((track, index) => (
                      <TrackRow
                        key={`${track.id ?? track.uri}-${index}`}
                        track={track}
                        rank={index + 1}
                      />
                    ))}
                  </div>
                </SpotifyPlaybackSourceProvider>
              ) : (
                <EmptyState
                  title="No track ranking yet"
                  description="Try another time window or keep listening in Spotify."
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <SectionHeading
            title="Recently played"
            description="The latest items Spotify made available"
          />
          <Card>
            <CardContent className="p-3">
              {snapshot.recentlyPlayed.items.length > 0 ? (
                <SpotifyPlaybackSourceProvider
                  source={{
                    type: "queue",
                    uris: GetSpotifyTrackUris(
                      snapshot.recentlyPlayed.items.map((item) => item.track),
                    ),
                  }}
                >
                  <div>
                    {snapshot.recentlyPlayed.items.map((item, index) => (
                      <TrackRow
                        key={`${item.played_at}-${item.track.id ?? index}`}
                        track={item.track}
                        trailing={FormatRelativeTime(item.played_at)}
                      />
                    ))}
                  </div>
                </SpotifyPlaybackSourceProvider>
              ) : (
                <EmptyState
                  title="Nothing recent to show"
                  description="Spotify did not return any recent tracks for this account."
                />
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

function MetadataItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span className="min-w-0">
      <span className="press-label block text-white/45">{label}</span>
      <span className="mt-1 block truncate text-white">{children}</span>
    </span>
  );
}

function ParseTimeRange(value: string | undefined): SpotifyTimeRange {
  if (value === "short_term" || value === "long_term") {
    return value;
  }

  return "medium_term";
}
