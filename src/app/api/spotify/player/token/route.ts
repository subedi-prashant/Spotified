import { NextResponse } from "next/server";

import { GetCurrentSession } from "@/lib/auth/session";
import { SpotifyApiError } from "@/lib/spotify/client";
import {
  GetSpotifyAccessToken,
  RequireSpotifyScopes,
  SpotifyAccountNotFoundError,
  SpotifyReconnectRequiredError,
  SpotifyScopesRequiredError,
} from "@/server/services/spotify-token-service";

export const dynamic = "force-dynamic";

const RESPONSE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  Pragma: "no-cache",
};

export async function GET(): Promise<NextResponse> {
  const session = await GetCurrentSession();

  if (!session) {
    return JsonResponse({ error: "unauthorized" }, 401);
  }

  try {
    await RequireSpotifyScopes(session.userId);
    const accessToken = await GetSpotifyAccessToken(session.userId);
    return JsonResponse({ accessToken }, 200);
  } catch (error) {
    if (error instanceof SpotifyScopesRequiredError) {
      return JsonResponse({ error: "missing_scopes" }, 403);
    }

    if (
      error instanceof SpotifyReconnectRequiredError ||
      error instanceof SpotifyAccountNotFoundError
    ) {
      return JsonResponse({ error: "reconnect_required" }, 409);
    }

    if (error instanceof SpotifyApiError && error.status === 429) {
      return JsonResponse({ error: "rate_limited" }, 429);
    }

    return JsonResponse({ error: "token_unavailable" }, 502);
  }
}

function JsonResponse(body: unknown, status: number): NextResponse {
  return NextResponse.json(body, { status, headers: RESPONSE_HEADERS });
}
