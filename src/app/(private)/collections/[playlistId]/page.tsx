import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { ProviderError } from "@/components/provider-error";
import { Artwork } from "@/components/spotify/artwork";
import { EpisodeRow } from "@/components/spotify/episode-row";
import { SpotifyPlaybackSourceProvider } from "@/components/spotify/player/playback-source";
import { TrackRow } from "@/components/spotify/track-row";
import { ButtonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RequireCurrentSession } from "@/lib/auth/session";
import { ParseOffset } from "@/lib/pagination";
import { SpotifyApiError } from "@/lib/spotify/client";
import { GetSpotifyPageError, type SpotifyPageError } from "@/lib/spotify/errors";
import { Cn } from "@/lib/utils";
import { CaptureSpotifyOperation } from "@/server/services/spotify-page-service";
import { GetSpotifyPlaylistDetails } from "@/server/services/spotify-service";

export const metadata: Metadata = {
  title: "Playlist items",
};

const PAGE_SIZE = 50;

export default async function PlaylistPage({
  params,
  searchParams,
}: {
  params: Promise<{ playlistId: string }>;
  searchParams: Promise<{ offset?: string }>;
}) {
  const session = await RequireCurrentSession();
  const { playlistId } = await params;
  const parameters = await searchParams;
  const offset = ParseOffset(parameters.offset, 100_000);

  const result = await CaptureSpotifyOperation(
    () => GetSpotifyPlaylistDetails(session.userId, playlistId, offset),
    GetPlaylistError,
  );

  if (!result.ok) {
    return (
      <div className="space-y-10">
        <BackToCollections />
        <PageHeader
          eyebrow="Playlist contents"
          title="This playlist cannot be opened here"
          description="Followed playlists can appear in your collection even when Spotify does not allow third-party apps to read their contents."
        />
        <ProviderError error={result.error} />
      </div>
    );
  }

  const details = result.data;
  const playableItems = details.items.items.filter((entry) => entry.item !== null);

  return (
    <div className="space-y-10">
      <BackToCollections />

      <section className="grid border border-foreground bg-card lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.62fr)]">
        <div className="flex min-w-0 flex-col justify-between bg-secondary p-6 text-white sm:p-8 lg:p-10">
          <div>
            <p className="press-label text-white/50">Owned or collaborative playlist</p>
            <h1 className="mt-6 text-balance font-display text-[clamp(3.4rem,8vw,6rem)] font-black uppercase leading-[0.78] tracking-[-0.03em]">
              {details.playlist.name}
            </h1>
            <p className="mt-7 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
              Spotify only exposes playlist contents here when this account owns or collaborates on
              the playlist. No playlist identity or genre score is calculated.
            </p>
            {details.playlist.description ? (
              <p className="mt-5 border-y border-white/30 py-4 text-xs leading-5 text-white/65">
                {details.playlist.description}
              </p>
            ) : null}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <span className="bg-primary px-3 py-2 text-xs font-bold tracking-[0.08em] text-black">
              {details.items.total} ITEMS
            </span>
            <span className="border border-white/40 px-3 py-2 text-xs">
              OWNER / {details.playlist.owner.display_name ?? "Spotify user"}
            </span>
            {details.playlist.external_urls.spotify ? (
              <a
                href={details.playlist.external_urls.spotify}
                target="_blank"
                rel="noreferrer"
                className={Cn(ButtonVariants({ variant: "outline", size: "sm" }), "ml-auto")}
              >
                Open in Spotify
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            ) : null}
          </div>
        </div>
        <div className="flex items-center justify-center border-t border-foreground bg-background p-4 sm:p-7 lg:border-l lg:border-t-0">
          <Artwork
            src={details.playlist.images[0]?.url}
            alt={`${details.playlist.name} cover`}
            kind="playlist"
            className="aspect-square w-full max-w-[36rem]"
          />
        </div>
      </section>

      {playableItems.length > 0 ? (
        <SpotifyPlaybackSourceProvider
          source={{ type: "context", contextUri: details.playlist.uri }}
        >
          <Card>
            <CardContent className="grid gap-x-8 p-3 lg:grid-cols-2">
              {playableItems.map((entry, index) => {
                if (!entry.item) {
                  return null;
                }

                if (entry.item.type === "episode") {
                  return (
                    <EpisodeRow
                      key={`${entry.item.id ?? entry.item.uri}-${index}`}
                      episode={entry.item}
                    />
                  );
                }

                return (
                  <TrackRow
                    key={`${entry.item.id ?? entry.item.uri}-${index}`}
                    track={entry.item}
                  />
                );
              })}
            </CardContent>
          </Card>
        </SpotifyPlaybackSourceProvider>
      ) : (
        <EmptyState
          title="No available items on this page"
          description="Tracks can be null when removed from Spotify, unavailable in the account market, or represented as unsupported item types."
        />
      )}
      <Pagination
        path={`/collections/${encodeURIComponent(playlistId)}`}
        offset={offset}
        pageSize={PAGE_SIZE}
        total={details.items.total}
      />
    </div>
  );
}

function BackToCollections() {
  return (
    <Link
      href="/collections"
      className="inline-flex items-center gap-2 border-b border-foreground pb-1 font-display text-sm font-bold uppercase tracking-[0.06em] hover:text-primary"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      All collections
    </Link>
  );
}

function GetPlaylistError(error: unknown): SpotifyPageError {
  if (error instanceof SpotifyApiError && error.status === 403) {
    return {
      title: "Spotify keeps this playlist private",
      description:
        "The account can see the playlist metadata, but Spotify only exposes items for playlists it owns or collaborates on.",
      action: "none",
    };
  }

  return GetSpotifyPageError(error);
}
