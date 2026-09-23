import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, KeyRound, Link2Off, LogOut, RefreshCw, ShieldCheck } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Artwork } from "@/components/spotify/artwork";
import { SpotifyAttribution } from "@/components/spotify/spotify-attribution";
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

  if (status === "connected") {
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

      {parameters.notice === "confirmation_required" ? (
        <div
          className="rounded-2xl border border-amber-300/20 bg-amber-300/5 px-5 py-4 text-sm text-amber-100"
          role="status"
        >
          Confirm the final disconnect action before data can be removed.
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>Spotify connection</CardTitle>
                <CardDescription>Read-only access for the approved beta account.</CardDescription>
              </div>
              <Badge variant={status === "connected" ? "default" : "secondary"}>
                {status === "connected" ? "Connected" : "Reconnect"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {profile ? (
              <div className="flex items-center gap-4 rounded-2xl border border-border bg-background/35 p-4">
                <Artwork
                  src={profile.images[0]?.url}
                  alt={`${profile.display_name ?? "Spotify"} profile`}
                  kind="artist"
                  className="size-14 rounded-2xl"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {profile.display_name ?? "Spotify user"}
                  </p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    Account ID ending in {profile.account_id.slice(-6)}
                  </p>
                </div>
                {profile.external_urls.spotify ? (
                  <a
                    href={profile.external_urls.spotify}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Open Spotify profile"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="size-4" aria-hidden="true" />
                  </a>
                ) : null}
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-background/35 p-4 text-sm text-muted-foreground">
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
              Spotified requests only the five read scopes used by its views.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-violet-400/10 text-violet-200">
                <ShieldCheck className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold">No playlist write access</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  The app cannot create, change, or delete anything in Spotify.
                </p>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              {SPOTIFY_SCOPES.map((scope) => (
                <div key={scope} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <KeyRound className="size-3.5 text-violet-300" aria-hidden="true" />
                  <code>{scope}</code>
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
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col items-start gap-4 rounded-2xl border border-border bg-background/30 p-5">
            <LogOut className="size-5 text-muted-foreground" aria-hidden="true" />
            <div className="space-y-1">
              <p className="text-sm font-semibold">Sign out on this browser</p>
              <p className="text-xs leading-5 text-muted-foreground">
                Deletes this browser session. The encrypted Spotify connection remains.
              </p>
            </div>
            <form action="/api/auth/logout" method="post" className="mt-auto">
              <Button type="submit" variant="outline">
                Sign out
              </Button>
            </form>
          </div>

          <details className="group rounded-2xl border border-destructive/20 bg-destructive/[0.035] p-5">
            <summary className="cursor-pointer list-none">
              <Link2Off className="size-5 text-red-300" aria-hidden="true" />
              <p className="mt-4 text-sm font-semibold">Disconnect and delete local data</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Removes the local user, encrypted tokens, and every session. Open for the final
                action.
              </p>
            </summary>
            <div className="mt-5 space-y-4 border-t border-destructive/15 pt-5">
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
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground underline hover:text-foreground"
              >
                Spotify’s access instructions
                <ExternalLink className="size-3" aria-hidden="true" />
              </a>
            </div>
          </details>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
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
