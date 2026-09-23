import { ExternalLink } from "lucide-react";

import { Cn } from "@/lib/utils";

export function SpotifyAttribution({ className }: { className?: string }) {
  return (
    <span
      className={Cn(
        "inline-flex items-center gap-1.5 text-[0.7rem] font-medium text-muted-foreground",
        className,
      )}
    >
      Data supplied by
      <a
        href="https://open.spotify.com/"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 font-bold text-[#1ed760] hover:underline"
      >
        Spotify
        <ExternalLink className="size-3" aria-hidden="true" />
      </a>
    </span>
  );
}
