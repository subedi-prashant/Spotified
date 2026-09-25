"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Clock3, Compass, LibraryBig, LogOut, Settings2, Sparkles } from "lucide-react";

import { BrandMark } from "@/components/brand-mark";
import { SpotifyPlayerBar } from "@/components/spotify/player/spotify-player-bar";
import { SpotifyPlayerProvider } from "@/components/spotify/player/spotify-player-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Cn } from "@/lib/utils";

const NAVIGATION: Array<{ href: string; label: string; code: string; icon: LucideIcon }> = [
  { href: "/snapshot", label: "Snapshot", code: "VIEW-01", icon: Sparkles },
  { href: "/collections", label: "Collections", code: "LIB-02", icon: LibraryBig },
  { href: "/recent", label: "Recent", code: "LOG-03", icon: Clock3 },
  { href: "/explore", label: "Explore", code: "FIND-04", icon: Compass },
  { href: "/settings", label: "Settings", code: "SYS-05", icon: Settings2 },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <SpotifyPlayerProvider>
      <div className="min-h-svh md:pl-60">
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-foreground bg-background md:flex">
          <Link
            href="/snapshot"
            aria-label="Spotified snapshot"
            className="border-b border-foreground p-5"
          >
            <BrandMark />
          </Link>
          <div className="grid grid-cols-2 border-b border-foreground bg-secondary text-secondary-foreground">
            <span className="border-r border-white/30 p-3">
              <span className="press-label block text-white/55">Mode</span>
              <span className="mt-1 block text-xs font-semibold">PRIVATE</span>
            </span>
            <span className="p-3">
              <span className="press-label block text-white/55">Access</span>
              <span className="mt-1 block text-xs font-semibold">OWNER</span>
            </span>
          </div>
          <nav className="flex-1" aria-label="Main navigation">
            {NAVIGATION.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={Cn(
                    "group grid grid-cols-[2.25rem_1fr] items-center border-b border-foreground/45 transition",
                    active ? "bg-primary text-primary-foreground" : "hover:bg-accent",
                  )}
                >
                  <span className="grid h-14 place-items-center border-r border-foreground/45">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 px-3 py-2">
                    <span className="press-quote block font-display text-base font-bold uppercase leading-none tracking-[0.05em]">
                      {item.label}
                    </span>
                    <span className="mt-1 block text-[0.58rem] font-semibold tracking-[0.13em] text-current opacity-60">
                      {item.code}
                    </span>
                  </span>
                </Link>
              );
            })}
          </nav>
          <div className="press-stripes h-9 border-y border-foreground" aria-hidden="true" />
          <ThemeToggle />
          <form action="/api/auth/logout" method="post" className="p-4">
            <Button type="submit" variant="outline" className="w-full justify-between">
              Sign out
              <LogOut className="size-4" aria-hidden="true" />
            </Button>
          </form>
        </aside>

        <header className="sticky top-0 z-40 flex h-17 items-center justify-between border-b border-foreground bg-background px-4 md:hidden">
          <Link href="/snapshot" aria-label="Spotified snapshot">
            <BrandMark compact />
          </Link>
          <span className="press-label">Private / Premium</span>
          <div className="flex items-center gap-1">
            <ThemeToggle compact />
            <form action="/api/auth/logout" method="post">
              <Button type="submit" variant="ghost" size="icon" aria-label="Sign out">
                <LogOut className="size-4" aria-hidden="true" />
              </Button>
            </form>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[100rem] px-4 pb-64 pt-7 sm:px-7 sm:pt-10 md:pb-40 lg:px-10">
          {children}
        </main>
        <SpotifyPlayerBar />

        <nav
          className="fixed inset-x-0 bottom-0 z-50 grid h-[4.75rem] grid-cols-5 border-t border-foreground bg-background md:hidden"
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
                  "flex min-w-0 flex-col items-center justify-center gap-1 border-r border-foreground/25 px-1 font-display text-[0.62rem] font-bold uppercase tracking-[0.05em] transition last:border-r-0",
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground",
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
