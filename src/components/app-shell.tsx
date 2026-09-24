"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Clock3, Compass, LibraryBig, LogOut, Settings2, Sparkles } from "lucide-react";

import { BrandMark } from "@/components/brand-mark";
import { SpotifyPlayerBar } from "@/components/spotify/player/spotify-player-bar";
import { SpotifyPlayerProvider } from "@/components/spotify/player/spotify-player-provider";
import { Button } from "@/components/ui/button";
import { Cn } from "@/lib/utils";

const NAVIGATION: Array<{ href: string; label: string; icon: LucideIcon }> = [
  { href: "/snapshot", label: "Snapshot", icon: Sparkles },
  { href: "/collections", label: "Collections", icon: LibraryBig },
  { href: "/recent", label: "Recent", icon: Clock3 },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/settings", label: "Settings", icon: Settings2 },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <SpotifyPlayerProvider>
      <div className="min-h-svh">
        <header className="sticky top-0 z-40 border-b border-white/[0.055] bg-background/78 backdrop-blur-2xl">
          <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/snapshot" aria-label="Spotified snapshot">
              <BrandMark />
            </Link>
            <nav
              className="hidden items-center gap-1 rounded-full border border-border/70 bg-card/50 p-1 md:flex"
              aria-label="Main navigation"
            >
              {NAVIGATION.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={Cn(
                      "inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-xs font-semibold transition",
                      active
                        ? "bg-foreground text-background shadow-sm"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <Icon className="size-3.5" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <form action="/api/auth/logout" method="post">
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="px-3"
                aria-label="Sign out"
              >
                <LogOut className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </form>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 pb-64 pt-8 sm:px-6 sm:pt-10 md:pb-36 lg:px-8">
          {children}
        </main>
        <SpotifyPlayerBar />
        <nav
          className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 rounded-[1.35rem] border border-white/10 bg-neutral-950/90 p-1.5 shadow-2xl backdrop-blur-xl md:hidden"
          aria-label="Mobile navigation"
        >
          {NAVIGATION.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={Cn(
                  "flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[0.62rem] font-semibold transition",
                  active ? "bg-white/10 text-white" : "text-neutral-500 hover:text-neutral-200",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </SpotifyPlayerProvider>
  );
}
