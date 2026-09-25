import Link from "next/link";
import { ArrowUpRight, LockKeyhole, Users } from "lucide-react";

import { Artwork } from "@/components/spotify/artwork";
import { ButtonVariants } from "@/components/ui/button";
import type { SpotifyPlaylist } from "@/lib/spotify/schemas";
import { Cn } from "@/lib/utils";

export function PlaylistCard({ playlist }: { playlist: SpotifyPlaylist }) {
  const itemCount = playlist.items?.total;
  const ownerLabel = playlist.owner.display_name ?? "Spotify user";

  return (
    <article className="group flex h-full flex-col border border-foreground/45 bg-card">
      <Artwork
        src={playlist.images[0]?.url}
        alt={`${playlist.name} cover`}
        kind="playlist"
        className="aspect-square w-full border-x-0 border-t-0"
      />
      <div className="flex flex-1 flex-col p-3">
        <div className="min-w-0">
          <h3 className="truncate font-display text-lg font-bold uppercase leading-none tracking-[0.02em]">
            {playlist.name}
          </h3>
          <p className="mt-2 truncate text-[0.7rem] uppercase tracking-[0.05em] text-muted-foreground">
            Owner / {ownerLabel}
          </p>
        </div>
        <div className="mt-5 flex items-center justify-between border-y border-dashed border-foreground/35 py-2 text-[0.68rem] text-muted-foreground">
          <span>{itemCount === undefined ? "Count unavailable" : `${itemCount} items`}</span>
          <span className="flex items-center gap-1.5">
            {playlist.collaborative ? (
              <Users className="size-3.5" aria-label="Collaborative playlist" />
            ) : playlist.public === false ? (
              <LockKeyhole className="size-3.5" aria-label="Private playlist" />
            ) : (
              <span>PUBLIC</span>
            )}
          </span>
        </div>
        <div className="mt-auto grid gap-2 pt-3">
          <Link
            href={`/collections/${encodeURIComponent(playlist.id)}?name=${encodeURIComponent(playlist.name)}`}
            className={Cn(ButtonVariants({ size: "sm" }), "w-full")}
          >
            View items
          </Link>
          {playlist.external_urls.spotify ? (
            <a
              href={playlist.external_urls.spotify}
              target="_blank"
              rel="noreferrer"
              className={Cn(ButtonVariants({ variant: "outline", size: "sm" }), "w-full")}
            >
              Open Spotify
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
