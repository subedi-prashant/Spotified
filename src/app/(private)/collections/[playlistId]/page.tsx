import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { ProviderError } from "@/components/provider-error";
import { EpisodeRow } from "@/components/spotify/episode-row";
import { SpotifyAttribution } from "@/components/spotify/spotify-attribution";
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
        <Link
          href="/collections"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All collections
        </Link>
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
      <Link
        href="/collections"
        className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All collections
      </Link>
      <PageHeader
        eyebrow="Owned or collaborative playlist"
        title={details.playlist.name}
        description="Spotify only exposes playlist contents here when this account owns or collaborates on the playlist. No playlist identity or genre score is calculated."
        action={
          details.playlist.external_urls.spotify ? (
            <a
              href={details.playlist.external_urls.spotify}
              target="_blank"
              rel="noreferrer"
              className={Cn(ButtonVariants({ variant: "outline", size: "sm" }), "gap-2")}
            >
              Open in Spotify
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
          ) : (
            <SpotifyAttribution />
          )
        }
      />
      {playableItems.length > 0 ? (
        <Card>
          <CardContent className="grid gap-x-8 p-3 sm:p-5 lg:grid-cols-2">
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
                <TrackRow key={`${entry.item.id ?? entry.item.uri}-${index}`} track={entry.item} />
              );
            })}
          </CardContent>
        </Card>
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
      <SpotifyAttribution className="justify-center" />
    </div>
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
