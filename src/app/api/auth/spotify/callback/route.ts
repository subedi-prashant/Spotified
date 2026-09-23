import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { SafeEqual } from "@/lib/auth/crypto";
import { CreateSession, SetSessionCookie } from "@/lib/auth/session";
import { ConfigurationError, GetAppBaseUrl } from "@/lib/env";
import { SpotifyApiError, SpotifyClient } from "@/lib/spotify/client";
import {
  ExchangeAuthorizationCode,
  SPOTIFY_STATE_COOKIE,
  SpotifyTokenError,
} from "@/lib/spotify/oauth";
import { ConnectSpotifyAccount } from "@/server/services/spotify-token-service";

export async function GET(request: NextRequest): Promise<NextResponse> {
  let baseUrl = request.nextUrl.origin;

  try {
    baseUrl = GetAppBaseUrl();
  } catch {
    return CreateRedirect("/?auth=configuration", baseUrl);
  }

  const returnedState = request.nextUrl.searchParams.get("state");
  const expectedState = request.cookies.get(SPOTIFY_STATE_COOKIE)?.value;

  if (!returnedState || !expectedState || !SafeEqual(returnedState, expectedState)) {
    return CreateRedirect("/?auth=invalid_state", baseUrl);
  }

  if (request.nextUrl.searchParams.has("error")) {
    return CreateRedirect("/?auth=denied", baseUrl);
  }

  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return CreateRedirect("/?auth=missing_code", baseUrl);
  }

  try {
    const tokens = await ExchangeAuthorizationCode(code);
    const profile = await new SpotifyClient(tokens.access_token).GetProfile();
    const userId = await ConnectSpotifyAccount(profile, tokens);
    const session = await CreateSession(userId);
    const response = CreateRedirect("/snapshot", baseUrl);
    SetSessionCookie(response, session.token, session.expiresAt);
    return response;
  } catch (error) {
    if (error instanceof ConfigurationError) {
      return CreateRedirect("/?auth=configuration", baseUrl);
    }

    if (error instanceof SpotifyApiError && error.status === 403) {
      return CreateRedirect("/?auth=allowlist", baseUrl);
    }

    if (error instanceof SpotifyTokenError) {
      return CreateRedirect("/?auth=authorization_failed", baseUrl);
    }

    return CreateRedirect("/?auth=failed", baseUrl);
  }
}

function CreateRedirect(path: string, baseUrl: string): NextResponse {
  const response = NextResponse.redirect(new URL(path, baseUrl));
  response.cookies.set(SPOTIFY_STATE_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth/spotify/callback",
    expires: new Date(0),
    priority: "high",
  });
  return response;
}
