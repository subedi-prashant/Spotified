import "server-only";

import { GetSpotifyPageError, type SpotifyPageError } from "@/lib/spotify/errors";

export type SpotifyPageResult<TData> =
  { ok: true; data: TData } | { ok: false; error: SpotifyPageError };

export async function CaptureSpotifyOperation<TData>(
  operation: () => Promise<TData>,
  errorMapper: (error: unknown) => SpotifyPageError = GetSpotifyPageError,
): Promise<SpotifyPageResult<TData>> {
  try {
    return { ok: true, data: await operation() };
  } catch (error) {
    return { ok: false, error: errorMapper(error) };
  }
}
