import { Disc3, Mic2 } from "lucide-react";

import { Cn } from "@/lib/utils";

export function Artwork({
  src,
  alt,
  kind = "track",
  className,
}: {
  src?: string;
  alt: string;
  kind?: "track" | "artist" | "playlist";
  className?: string;
}) {
  if (src) {
    return (
      <span
        className={Cn("relative block shrink-0 border border-foreground/40 bg-card", className)}
      >
        <img src={src} alt={alt} className="size-full object-contain" loading="lazy" />
      </span>
    );
  }

  return (
    <span
      className={Cn(
        "grid shrink-0 place-items-center border border-foreground bg-muted text-muted-foreground",
        className,
      )}
      role="img"
      aria-label={`${alt} artwork unavailable`}
    >
      {kind === "artist" ? (
        <Mic2 className="size-1/3" aria-hidden="true" />
      ) : (
        <Disc3 className="size-1/3" aria-hidden="true" />
      )}
    </span>
  );
}
