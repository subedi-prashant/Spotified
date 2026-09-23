import { describe, expect, it } from "vitest";

import { FormatArtists, FormatDuration, FormatRelativeTime } from "@/lib/spotify/format";

const NOW = new Date("2026-09-23T12:00:00.000Z");

describe("Spotify display formatting", () => {
  it("formats artist credits without changing their names", () => {
    expect(FormatArtists([{ name: "Artist One" }, { name: "Artist Two" }])).toBe(
      "Artist One, Artist Two",
    );
  });

  it("formats track duration", () => {
    expect(FormatDuration(203000)).toBe("3:23");
  });

  it("formats recent timestamps without claiming unsupported precision", () => {
    expect(FormatRelativeTime("2026-09-23T11:59:40.000Z", NOW)).toBe("just now");
    expect(FormatRelativeTime("2026-09-23T10:00:00.000Z", NOW)).toBe("2h ago");
    expect(FormatRelativeTime("2026-09-20T12:00:00.000Z", NOW)).toBe("3d ago");
  });
});
