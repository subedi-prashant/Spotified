import type { Metadata } from "next";
import Link from "next/link";
import {
  ExternalLink,
  KeyRound,
  Link2Off,
  LogOut,
  Play,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Artwork } from "@/components/spotify/artwork";
import { SpotifyAttribution } from "@/components/spotify/spotify-attribution";
import { AppearanceSettings } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RequireCurrentSession } from "@/lib/auth/session";
import { SPOTIFY_SCOPES } from "@/lib/spotify/oauth";
import type { SpotifyProfile } from "@/lib/spotify/schemas";
import { GetSpotifyProfile } from "@/server/services/spotify-service";
import { GetSpotifyConnectionStatus } from "@/server/services/spotify-token-service";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const session = await RequireCurrentSession();
  const parameters = await searchParams;
  const status = await GetSpotifyConnectionStatus(session.userId);
  let profile: SpotifyProfile | null = null;

  if (status === "connected" || status === "missing_scopes") {
    try {
      profile = await GetSpotifyProfile(session.userId);
    } catch {
      profile = null;
    }
  }

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Account controls"
        title="Settings"
        description="Review the connection, sign out of this browser, or permanently remove the locally stored Spotify credentials."
        action={<SpotifyAttribution />}
      />

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Keep the original Spotified interface or use the new record-press visual system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AppearanceSettings />
        </CardContent>
      </Card>

      {parameters.notice === "confirmation_required" ? (
        <div className="border border-foreground bg-primary px-5 py-4 text-sm" role="status">
          <span className="press-label mr-3">Action held</span>
          Confirm the final disconnect action before data can be removed.
        </div>
      ) : null}

      {status === "missing_scopes" ? (
        <div
          className="border border-foreground bg-secondary px-5 py-4 text-sm text-white"
          role="status"
        >
          <span className="press-label mr-3 text-primary">Reconnect required</span>
          Reconnect Spotify once to approve Premium web playback. Your existing account data remains
          connected until then.
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>Spotify connection</CardTitle>
                <CardDescription>
                  Private account views and Premium playback for the approved beta account.
                </CardDescription>
              </div>
              <Badge variant={status === "connected" ? "default" : "secondary"}>
                {status === "connected" ? "Connected" : "Reconnect"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {profile ? (
              <div className="grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-4 border border-foreground bg-background p-4">
                <Artwork
                  src={profile.images[0]?.url}
                  alt={`${profile.display_name ?? "Spotify"} profile`}
                  kind="artist"
                  className="size-14"
                />
                <div className="min-w-0">
                  <p className="truncate font-display text-lg font-bold uppercase leading-none">
                    {profile.display_name ?? "Spotify user"}
                  </p>
                  <p className="mt-2 truncate text-xs text-muted-foreground">
                    Account ID ending in {profile.account_id.slice(-6)}
                  </p>
                </div>
                {profile.external_urls.spotify ? (
                  <a
                    href={profile.external_urls.spotify}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Open Spotify profile"
                    className="grid size-9 place-items-center border border-foreground text-muted-foreground hover:bg-foreground hover:text-background"
                  >
                    <ExternalLink className="size-4" aria-hidden="true" />
                  </a>
                ) : null}
              </div>
            ) : (
              <div className="border border-dashed border-foreground bg-background p-4 text-sm text-muted-foreground">
                Profile details are unavailable until Spotify is reconnected.
              </div>
            )}
            <form action="/api/auth/spotify/reconnect" method="post">
              <Button type="submit" variant="outline">
                <RefreshCw className="size-4" aria-hidden="true" />
                Reconnect Spotify
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Permission boundary</CardTitle>
            <CardDescription>
              Spotified requests account-read scopes plus the minimum scopes for Premium web
              playback.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-[2.75rem_1fr] gap-4">
              <span className="grid size-11 place-items-center border border-foreground bg-primary">
                <ShieldCheck className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="font-display text-lg font-bold uppercase leading-none">
                  No content or library writes
                </p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  The app cannot create, edit, save, or delete Spotify playlists or library items.
                </p>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-[2.75rem_1fr] gap-4">
              <span className="grid size-11 place-items-center border border-foreground bg-secondary text-white">
                <Play className="ml-0.5 size-4 fill-current" aria-hidden="true" />
              </span>
              <div>
                <p className="font-display text-lg font-bold uppercase leading-none">
                  Playback control exception
                </p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Premium users can stream and control songs in this browser through Spotify’s
                  official SDK.
                </p>
              </div>
            </div>
            <Separator />
            <div className="grid gap-px bg-foreground sm:grid-cols-2">
              {SPOTIFY_SCOPES.map((scope) => (
                <div key={scope} className="flex items-center gap-2 bg-card p-3 text-xs">
                  <KeyRound className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
                  <code className="truncate">{scope}</code>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Session and data controls</CardTitle>
          <CardDescription>
            Signing out and disconnecting are intentionally different actions.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-px bg-foreground p-px sm:grid-cols-2">
          <div className="flex flex-col items-start gap-4 bg-card p-6">
            <span className="grid size-11 place-items-center border border-foreground bg-background">
              <LogOut className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-display text-xl font-bold uppercase leading-none">
                Sign out on this browser
              </p>
              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                Deletes this browser session. The encrypted Spotify connection remains.
              </p>
            </div>
            <form action="/api/auth/logout" method="post" className="mt-auto">
              <Button type="submit" variant="outline">
                Sign out
              </Button>
            </form>
          </div>

          <details className="group bg-card p-6">
            <summary className="cursor-pointer list-none">
              <span className="grid size-11 place-items-center border border-foreground bg-destructive text-white">
                <Link2Off className="size-5" aria-hidden="true" />
              </span>
              <p className="mt-5 font-display text-xl font-bold uppercase leading-none">
                Disconnect and delete local data
              </p>
              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                Removes the local user, encrypted tokens, and every session. Open for the final
                action.
              </p>
            </summary>
            <div className="mt-5 space-y-4 border-t border-dashed border-foreground pt-5">
              <p className="text-xs leading-5 text-muted-foreground">
                This cannot remotely revoke Spotify’s grant. Follow Spotify’s Manage Apps
                instructions after disconnecting if you also want to remove provider-side access.
              </p>
              <form action="/api/auth/disconnect" method="post">
                <Button type="submit" name="confirm" value="disconnect" variant="destructive">
                  Disconnect and delete
                </Button>
              </form>
              <a
                href="https://support.spotify.com/us/article/spotify-on-other-apps/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold underline hover:text-primary"
              >
                Spotify’s access instructions
                <ExternalLink className="size-3" aria-hidden="true" />
              </a>
            </div>
          </details>
        </CardContent>
      </Card>

      <p className="border-t border-foreground pt-5 text-center text-xs text-muted-foreground">
        Read the{" "}
        <Link href="/privacy" className="underline hover:text-foreground">
          privacy notice
        </Link>{" "}
        and{" "}
        <Link href="/terms" className="underline hover:text-foreground">
          terms
        </Link>
        .
      </p>
    </div>
  );
}
