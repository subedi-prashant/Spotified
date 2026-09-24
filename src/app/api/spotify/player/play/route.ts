import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { AssertSameOrigin, InvalidRequestOriginError } from "@/lib/auth/request";
import { GetCurrentSession } from "@/lib/auth/session";
import { SpotifyApiError, type SpotifyStartPlaybackCommand } from "@/lib/spotify/client";
import { BuildSpotifyQueue, SpotifyPlayRequestSchema } from "@/lib/spotify/playback";
import {
  RequireSpotifyScopes,
  RunSpotifyOperation,
  SpotifyAccountNotFoundError,
  SpotifyReconnectRequiredError,
  SpotifyScopesRequiredError,
} from "@/server/services/spotify-token-service";

export const dynamic = "force-dynamic";

const RESPONSE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  Pragma: "no-cache",
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    AssertSameOrigin(request);
  } catch (error) {
    if (error instanceof InvalidRequestOriginError) {
      return JsonResponse({ error: "forbidden" }, 403);
    }

    throw error;
  }

  const session = await GetCurrentSession();

  if (!session) {
    return JsonResponse({ error: "unauthorized" }, 401);
  }

  const body = await request.json().catch(() => null);
  const result = SpotifyPlayRequestSchema.safeParse(body);

  if (!result.success) {
    return JsonResponse({ error: "invalid_request" }, 400);
  }

  const command: SpotifyStartPlaybackCommand =
    result.data.sourceType === "context"
      ? {
          deviceId: result.data.deviceId,
          contextUri: result.data.contextUri,
          offsetUri: result.data.trackUri,
        }
      : {
          deviceId: result.data.deviceId,
          uris: BuildSpotifyQueue(result.data.uris, result.data.trackUri),
        };

  if ("uris" in command && command.uris.length === 0) {
    return JsonResponse({ error: "invalid_queue" }, 400);
  }

  try {
    await RequireSpotifyScopes(session.userId);
    await RunSpotifyOperation(session.userId, (client) => client.StartPlayback(command));
    return new NextResponse(null, { status: 204, headers: RESPONSE_HEADERS });
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

    if (error instanceof SpotifyApiError) {
      if (error.status === 403) {
        return JsonResponse({ error: "playback_forbidden" }, 403);
      }

      if (error.status === 429) {
        return JsonResponse(
          { error: "rate_limited", retryAfterSeconds: error.retryAfterSeconds },
          429,
        );
      }
    }

    return JsonResponse({ error: "playback_unavailable" }, 502);
  }
}

function JsonResponse(body: unknown, status: number): NextResponse {
  return NextResponse.json(body, { status, headers: RESPONSE_HEADERS });
}
