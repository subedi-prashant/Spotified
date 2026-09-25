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
      className="inline-grid grid-cols-3 border border-foreground"
      aria-label="Spotify affinity time range"
    >
      {RANGES.map((range) => (
        <Link
          key={range.value}
          href={`/snapshot?range=${range.value}`}
          aria-current={range.value === selected ? "page" : undefined}
          className={Cn(
            "border-r border-foreground px-3 py-2 font-display text-xs font-bold uppercase tracking-[0.08em] transition last:border-r-0 sm:px-4",
            range.value === selected
              ? "bg-foreground text-background"
              : "bg-background text-muted-foreground hover:bg-primary hover:text-foreground",
          )}
        >
          {range.label}
        </Link>
      ))}
    </nav>
  );
}
