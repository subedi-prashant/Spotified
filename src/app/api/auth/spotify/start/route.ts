import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { GenerateOpaqueToken } from "@/lib/auth/crypto";
import { GetAppBaseUrl } from "@/lib/env";
import { BuildSpotifyAuthorizationUrl, SPOTIFY_STATE_COOKIE } from "@/lib/spotify/oauth";
const STATE_DURATION_SECONDS = 10 * 60;

export function GET(request: NextRequest): NextResponse {
  if (request.nextUrl.searchParams.get("consent") !== "accepted") {
    return NextResponse.redirect(
      new URL("/privacy?notice=consent_required", request.nextUrl.origin),
    );
  }

  let appBaseUrl = request.nextUrl.origin;

  try {
    appBaseUrl = GetAppBaseUrl();
    const state = GenerateOpaqueToken();
    const response = NextResponse.redirect(BuildSpotifyAuthorizationUrl(state));
    response.cookies.set(SPOTIFY_STATE_COOKIE, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/auth/spotify/callback",
      maxAge: STATE_DURATION_SECONDS,
      priority: "high",
    });
    return response;
  } catch {
    return NextResponse.redirect(new URL("/?auth=configuration", appBaseUrl));
  }
}
