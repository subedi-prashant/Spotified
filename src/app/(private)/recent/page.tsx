import type { Metadata } from "next";
import { Clock3 } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { ProviderError } from "@/components/provider-error";
import { SpotifyPlaybackSourceProvider } from "@/components/spotify/player/playback-source";
import { TrackRow } from "@/components/spotify/track-row";
import { Card, CardContent } from "@/components/ui/card";
import { RequireCurrentSession } from "@/lib/auth/session";
import { FormatRelativeTime } from "@/lib/spotify/format";
import { GetSpotifyTrackUris } from "@/lib/spotify/playback";
import { CaptureSpotifyOperation } from "@/server/services/spotify-page-service";
import { GetSpotifyRecent } from "@/server/services/spotify-service";

export const metadata: Metadata = {
  title: "Recently played",
};

export default async function RecentPage() {
  const session = await RequireCurrentSession();

  const result = await CaptureSpotifyOperation(() => GetSpotifyRecent(session.userId));

  if (!result.ok) {
    return (
      <div className="space-y-10">
        <PageHeader
          eyebrow="Spotify playback history"
          title="Recently played"
          description="Spotified only displays complete, validated responses from Spotify."
        />
        <ProviderError error={result.error} />
      </div>
    );
  }

  const recent = result.data;

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Spotify playback history"
        title="Recently played"
        description="Up to 50 of the latest track records Spotify currently exposes. This is a limited recent feed—not your full listening history."
      />

      {recent.items.length > 0 ? (
        <SpotifyPlaybackSourceProvider
          source={{
            type: "queue",
            uris: GetSpotifyTrackUris(recent.items.map((item) => item.track)),
          }}
        >
          <Card>
            <CardContent className="p-3 sm:p-5">
              <div className="grid gap-x-8 lg:grid-cols-2">
                {recent.items.map((item, index) => (
                  <TrackRow
                    key={`${item.played_at}-${item.track.id ?? index}`}
                    track={item.track}
                    trailing={FormatRelativeTime(item.played_at)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </SpotifyPlaybackSourceProvider>
      ) : (
        <EmptyState
          title="No recent tracks available"
          description="Play some music in Spotify, then return after Spotify makes the records available."
          action={<Clock3 className="size-4 text-muted-foreground" aria-hidden="true" />}
        />
      )}
    </div>
  );
}
