import Link from "next/link";
import { ArrowUpRight, LockKeyhole, Users } from "lucide-react";

import { Artwork } from "@/components/spotify/artwork";
import type { SpotifyPlaylist } from "@/lib/spotify/schemas";

export function PlaylistCard({ playlist }: { playlist: SpotifyPlaylist }) {
  const itemCount = playlist.items?.total;
  const ownerLabel = playlist.owner.display_name ?? "Spotify user";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.35rem] border border-border/70 bg-card/55 p-3 transition hover:-translate-y-0.5 hover:border-foreground/15 hover:bg-card">
      <Artwork
        src={playlist.images[0]?.url}
        alt={`${playlist.name} cover`}
        kind="playlist"
        className="aspect-square w-full rounded-2xl"
      />
      <div className="flex flex-1 flex-col gap-3 px-1 pb-1 pt-4">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold">{playlist.name}</h3>
          <p className="mt-1 truncate text-xs text-muted-foreground">By {ownerLabel}</p>
        </div>
        <div className="mt-auto flex items-center justify-between text-[0.7rem] text-muted-foreground">
          <span>{itemCount === undefined ? "Item count unavailable" : `${itemCount} items`}</span>
          <span className="flex items-center gap-1">
            {playlist.collaborative ? (
              <Users className="size-3.5" aria-label="Collaborative playlist" />
            ) : playlist.public === false ? (
              <LockKeyhole className="size-3.5" aria-label="Private playlist" />
            ) : null}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Link
            href={`/collections/${encodeURIComponent(playlist.id)}?name=${encodeURIComponent(playlist.name)}`}
            className="inline-flex h-9 items-center justify-center rounded-full border border-border bg-background/40 px-3 text-xs font-semibold transition hover:border-foreground/20 hover:bg-accent"
          >
            View items
          </Link>
          {playlist.external_urls.spotify ? (
            <a
              href={playlist.external_urls.spotify}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-secondary px-3 text-xs font-semibold transition hover:bg-secondary/80"
            >
              Spotify
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </a>
          ) : (
            <span />
          )}
        </div>
      </div>
    </article>
  );
}
