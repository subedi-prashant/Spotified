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
import { GetCurrentSession } from "@/lib/auth/session";

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
    <main className="min-h-svh bg-background">
      <div className="mx-auto grid min-h-svh max-w-[112rem] lg:grid-cols-[14rem_minmax(0,1fr)]">
        <aside className="flex flex-col border-b border-foreground lg:border-b-0 lg:border-r">
          <div className="p-5 lg:p-6">
            <BrandMark />
          </div>
          <div className="hidden flex-1 border-t border-foreground lg:flex lg:flex-col">
            <div className="grid grid-cols-2 border-b border-foreground">
              <span className="border-r border-foreground p-4">
                <span className="press-label block text-muted-foreground">Object</span>
                <span className="mt-2 block text-sm font-bold">SPTFD-01</span>
              </span>
              <span className="p-4">
                <span className="press-label block text-muted-foreground">Mode</span>
                <span className="mt-2 block text-sm font-bold">PRIVATE</span>
              </span>
            </div>
            <div className="p-4">
              <span className="press-label text-muted-foreground">Purpose</span>
              <p className="mt-3 text-xs leading-5">
                Exact Spotify data. Full-length Premium playback. One owner-controlled space.
              </p>
            </div>
            <div className="mt-auto">
              <div className="press-stripes h-32 border-y border-foreground" aria-hidden="true" />
              <p className="p-4 text-[0.68rem] leading-5 text-muted-foreground">
                Independent personal project. Not endorsed by Spotify.
              </p>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="flex min-h-17 items-center justify-between gap-4 border-b border-foreground px-5 py-3 sm:px-8 lg:px-10">
            <p className="press-label hidden text-muted-foreground sm:block">
              Private / Non-commercial / Premium playback
            </p>
            <div className="ml-auto flex items-center gap-3">
              <Badge variant="secondary">Private beta</Badge>
              {session ? (
                <Link
                  href="/snapshot"
                  className={ButtonVariants({ variant: "outline", size: "sm" })}
                >
                  Open snapshot
                </Link>
              ) : null}
            </div>
          </header>

          {notice ? (
            <div
              className="border-b border-foreground bg-primary px-5 py-4 sm:px-8 lg:px-10"
              role="status"
            >
              <p className="font-display text-lg font-bold uppercase leading-none">
                {notice.title}
              </p>
              <p className="mt-2 text-xs leading-5 sm:text-sm">{notice.description}</p>
            </div>
          ) : null}

          <section className="grid flex-1 xl:grid-cols-[minmax(0,0.92fr)_minmax(32rem,1.08fr)]">
            <div className="flex flex-col justify-center border-b border-foreground px-5 py-14 sm:px-8 sm:py-18 lg:px-10 xl:border-b-0 xl:border-r xl:py-20">
              <div className="max-w-3xl">
                <h1 className="press-quote text-balance font-display text-[clamp(3.8rem,8vw,6rem)] font-black uppercase leading-[0.78] tracking-[-0.03em]">
                  A quieter way to see and play your music.
                </h1>
                <p className="mt-7 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                  Spotified brings your Spotify rankings, recent plays, saved tracks, playlists, and
                  Premium web playback into one focused private space—without inventing metrics
                  Spotify does not provide.
                </p>
                <p className="press-label mt-6 flex items-center gap-2 text-muted-foreground">
                  <span className="size-2 bg-primary" aria-hidden="true" />
                  Your music / Exact metadata / Explicit playback
                </p>
              </div>

              <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                {session ? (
                  <Link href="/snapshot" className={ButtonVariants({ size: "lg" })}>
                    Continue to your snapshot
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                ) : (
                  <a
                    href="/api/auth/spotify/start?consent=accepted"
                    className={ButtonVariants({ size: "lg" })}
                  >
                    Connect Spotify
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </a>
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

              <div className="mt-10 grid border border-foreground sm:grid-cols-3">
                <TrustItem icon={LockKeyhole} label="Encrypted credentials" />
                <TrustItem icon={ShieldCheck} label="Premium web playback" />
                <TrustItem icon={Fingerprint} label="Delete anytime" />
              </div>
            </div>

            <div className="flex flex-col bg-secondary text-secondary-foreground">
              <div className="flex items-center justify-between border-b border-white/35 px-5 py-4 sm:px-7">
                <div>
                  <p className="press-label text-white/50">Capability manifest</p>
                  <p className="mt-2 font-display text-xl font-bold uppercase leading-none">
                    What Spotify can show directly
                  </p>
                </div>
                <Badge className="border-white bg-primary text-black">API / SDK</Badge>
              </div>
              <div className="flex flex-1 flex-col">
                <PreviewRow
                  code="AFF-01"
                  icon={Sparkles}
                  title="Top by affinity"
                  description="Spotify's own artist and track ranking"
                />
                <PreviewRow
                  code="LOG-02"
                  icon={Clock3}
                  title="Recently played"
                  description="Tracks and their supplied timestamps"
                />
                <PreviewRow
                  code="LIB-03"
                  icon={LibraryBig}
                  title="Your collection"
                  description="Saved tracks and playlist metadata"
                />
                <PreviewRow
                  code="PLAY-04"
                  icon={Music2}
                  title="Premium web playback"
                  description="Full songs through Spotify’s official SDK"
                />
              </div>
              <div className="border-t border-white/35 px-5 py-5 sm:px-7">
                <p className="font-display text-lg font-bold uppercase">
                  No made-up listening minutes.
                </p>
                <p className="mt-2 max-w-xl text-xs leading-5 text-white/60">
                  Every view says what came from Spotify and what it actually means.
                </p>
              </div>
              <div
                className="press-stripes h-11 border-t border-white/35 [--foreground:#ff4f00]"
                aria-hidden="true"
              />
            </div>
          </section>

          <footer className="flex flex-col gap-3 border-t border-foreground px-5 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
            <p>Spotified is an independent personal project and is not endorsed by Spotify.</p>
            <nav className="flex gap-5" aria-label="Legal">
              <Link href="/privacy" className="underline hover:text-foreground">
                Privacy
              </Link>
              <Link href="/terms" className="underline hover:text-foreground">
                Terms
              </Link>
            </nav>
          </footer>
        </div>
      </div>
    </main>
  );
}

function PreviewRow({
  code,
  icon: Icon,
  title,
  description,
}: {
  code: string;
  icon: typeof Sparkles;
  title: string;
  description: string;
}) {
  return (
    <div className="grid flex-1 grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-4 border-b border-white/35 px-5 py-5 sm:px-7">
      <span className="grid size-10 place-items-center border border-white/45 text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block font-display text-2xl font-bold uppercase leading-[0.9]">
          {title}
        </span>
        <span className="mt-2 block text-xs leading-5 text-white/60">{description}</span>
      </span>
      <span className="hidden text-[0.62rem] font-semibold tracking-[0.15em] text-white/45 sm:block">
        {code}
      </span>
    </div>
  );
}

function TrustItem({ icon: Icon, label }: { icon: typeof LockKeyhole; label: string }) {
  return (
    <span className="flex items-center gap-2 border-b border-foreground p-3 text-xs font-semibold last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <Icon className="size-4 text-primary" aria-hidden="true" />
      {label}
    </span>
  );
}
