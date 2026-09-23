import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  Fingerprint,
  LibraryBig,
  LockKeyhole,
  Music2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { BrandMark } from "@/components/brand-mark";
import { Badge } from "@/components/ui/badge";
import { ButtonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GetCurrentSession } from "@/lib/auth/session";
import { Cn } from "@/lib/utils";

const AUTH_MESSAGES: Record<string, { title: string; description: string }> = {
  allowlist: {
    title: "This account is not on the beta allowlist",
    description: "The Spotify app owner must add it in Developer Dashboard → Users Management.",
  },
  authorization_failed: {
    title: "Spotify could not finish connecting",
    description:
      "Try again. If it continues, verify the exact redirect URI in the developer dashboard.",
  },
  configuration: {
    title: "The app is not configured yet",
    description: "Add the required server environment variables before connecting Spotify.",
  },
  denied: {
    title: "Connection cancelled",
    description: "Nothing was stored. Connect whenever you are ready.",
  },
  disconnected: {
    title: "Spotify disconnected",
    description: "Your local account, tokens, and sessions were deleted.",
  },
  failed: {
    title: "Connection did not complete",
    description: "No partial account data was shown. Please try again.",
  },
  invalid_state: {
    title: "That sign-in request expired",
    description: "Start a new connection to protect your account.",
  },
  missing_code: {
    title: "Spotify did not return an authorization code",
    description: "Please start the connection again.",
  },
  session_expired: {
    title: "Your session expired",
    description: "Reconnect Spotify to open your private music view.",
  },
  signed_out: {
    title: "Signed out",
    description: "Your Spotify connection remains saved until you choose to disconnect it.",
  },
};

export default async function Home({ searchParams }: { searchParams: Promise<{ auth?: string }> }) {
  const parameters = await searchParams;
  const notice = parameters.auth ? AUTH_MESSAGES[parameters.auth] : undefined;
  const session = await GetCurrentSession();

  return (
    <main className="atlas-grid relative min-h-svh overflow-hidden">
      <div className="pointer-events-none absolute left-[8%] top-12 size-72 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[4%] top-1/3 size-64 rounded-full bg-orange-300/[0.07] blur-3xl" />
      <div className="relative mx-auto flex min-h-svh max-w-7xl flex-col px-5 sm:px-8 lg:px-10">
        <header className="flex h-22 items-center justify-between">
          <BrandMark />
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="hidden sm:inline-flex">
              Private beta
            </Badge>
            {session ? (
              <Link href="/snapshot" className={ButtonVariants({ variant: "outline", size: "sm" })}>
                Open snapshot
              </Link>
            ) : null}
          </div>
        </header>

        {notice ? (
          <div
            className="mx-auto mt-2 w-full max-w-3xl rounded-2xl border border-primary/20 bg-primary/[0.07] px-5 py-4"
            role="status"
          >
            <p className="text-sm font-semibold">{notice.title}</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">
              {notice.description}
            </p>
          </div>
        ) : null}

        <section className="grid flex-1 items-center gap-14 py-14 lg:grid-cols-[1.02fr_0.98fr] lg:py-20">
          <div className="max-w-2xl space-y-9">
            <Badge variant="outline">
              <Sparkles className="size-3" aria-hidden="true" />
              Your music, clearly seen
            </Badge>
            <div className="space-y-6">
              <h1 className="text-balance text-[clamp(3.25rem,8vw,6.8rem)] font-semibold leading-[0.88] tracking-[-0.075em]">
                A quieter view of your music.
              </h1>
              <p className="max-w-xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                Music Atlas brings your Spotify rankings, recent plays, saved tracks, and playlists
                into one focused private space—without pretending they are metrics Spotify does not
                provide.
              </p>
            </div>
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              {session ? (
                <Link href="/snapshot" className={ButtonVariants({ size: "lg" })}>
                  Continue to your snapshot
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              ) : (
                <Link
                  href="/api/auth/spotify/start?consent=accepted"
                  className={ButtonVariants({ size: "lg" })}
                >
                  Connect Spotify
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              )}
              <span className="max-w-xs text-xs leading-5 text-muted-foreground">
                By connecting, you agree to the{" "}
                <Link className="underline hover:text-foreground" href="/terms">
                  terms
                </Link>{" "}
                and acknowledge the{" "}
                <Link className="underline hover:text-foreground" href="/privacy">
                  privacy notice
                </Link>
                .
              </span>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <LockKeyhole className="size-4 text-violet-300" aria-hidden="true" />
                Server-side tokens
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="size-4 text-violet-300" aria-hidden="true" />
                Read-only access
              </span>
              <span className="inline-flex items-center gap-2">
                <Fingerprint className="size-4 text-violet-300" aria-hidden="true" />
                Delete anytime
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div className="atlas-orb absolute -left-7 -top-8 size-24 rotate-[-8deg] rounded-[2rem] border border-white/10 bg-gradient-to-br from-violet-400 to-fuchsia-500 p-4 text-neutral-950 shadow-2xl">
              <Music2 className="size-8" strokeWidth={1.8} aria-hidden="true" />
            </div>
            <Card className="relative overflow-hidden border-white/10 bg-[#11121a]/90 p-3 shadow-[0_45px_120px_-55px_rgba(167,139,250,0.5)] sm:p-5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,121,249,0.10),transparent_40%)]" />
              <CardContent className="relative space-y-4 p-2 sm:p-3">
                <div className="flex items-center justify-between px-2 py-1">
                  <div>
                    <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-violet-300">
                      Private snapshot
                    </p>
                    <p className="mt-1 text-sm font-semibold">What Spotify can show directly</p>
                  </div>
                  <span className="rounded-full border border-[#1ed760]/20 bg-[#1ed760]/10 px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-[#1ed760]">
                    Spotify API
                  </span>
                </div>
                <PreviewRow
                  icon={Sparkles}
                  title="Top by affinity"
                  description="Spotify's own artist and track ranking"
                  tone="violet"
                />
                <PreviewRow
                  icon={Clock3}
                  title="Recently played"
                  description="Tracks and their supplied timestamps"
                  tone="orange"
                />
                <PreviewRow
                  icon={LibraryBig}
                  title="Your collection"
                  description="Saved tracks and playlist metadata"
                  tone="pink"
                />
                <div className="rounded-2xl border border-dashed border-white/10 bg-black/15 px-5 py-4">
                  <p className="text-xs font-semibold text-foreground">
                    No made-up listening minutes.
                  </p>
                  <p className="mt-1 text-[0.7rem] leading-5 text-muted-foreground">
                    Every view says what came from Spotify and what it actually means.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <footer className="flex flex-col gap-3 border-t border-border/70 py-7 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>Music Atlas is an independent personal project and is not endorsed by Spotify.</p>
          <nav className="flex gap-4" aria-label="Legal">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
          </nav>
        </footer>
      </div>
    </main>
  );
}

function PreviewRow({
  icon: Icon,
  title,
  description,
  tone,
}: {
  icon: typeof Sparkles;
  title: string;
  description: string;
  tone: "violet" | "orange" | "pink";
}) {
  const tones = {
    violet: "from-violet-400/25 to-violet-400/5 text-violet-200",
    orange: "from-orange-300/20 to-orange-300/5 text-orange-200",
    pink: "from-fuchsia-400/20 to-fuchsia-400/5 text-fuchsia-200",
  };

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 sm:p-5">
      <span
        className={Cn(
          "grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br",
          tones[tone],
        )}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-muted-foreground">{description}</span>
      </span>
    </div>
  );
}
