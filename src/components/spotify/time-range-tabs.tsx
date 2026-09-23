import Link from "next/link";

import type { SpotifyTimeRange } from "@/lib/spotify/client";
import { Cn } from "@/lib/utils";

const RANGES: Array<{ value: SpotifyTimeRange; label: string }> = [
  { value: "short_term", label: "4 weeks" },
  { value: "medium_term", label: "6 months" },
  { value: "long_term", label: "1 year" },
];

export function TimeRangeTabs({ selected }: { selected: SpotifyTimeRange }) {
  return (
    <nav
      className="inline-flex rounded-full border border-border bg-background/50 p-1"
      aria-label="Spotify affinity time range"
    >
      {RANGES.map((range) => (
        <Link
          key={range.value}
          href={`/snapshot?range=${range.value}`}
          aria-current={range.value === selected ? "page" : undefined}
          className={Cn(
            "rounded-full px-3 py-1.5 text-xs font-semibold transition sm:px-4",
            range.value === selected
              ? "bg-foreground text-background shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {range.label}
        </Link>
      ))}
    </nav>
  );
}
