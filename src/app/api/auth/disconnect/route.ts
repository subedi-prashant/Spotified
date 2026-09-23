import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { AssertSameOrigin, InvalidRequestOriginError } from "@/lib/auth/request";
import { ClearSessionCookie, ResolveSessionToken, SESSION_COOKIE } from "@/lib/auth/session";
import { GetAppBaseUrl } from "@/lib/env";
import { DisconnectSpotifyAccount } from "@/server/services/spotify-token-service";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    AssertSameOrigin(request);
  } catch (error) {
    if (error instanceof InvalidRequestOriginError) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    throw error;
  }

  const formData = await request.formData();

  if (formData.get("confirm") !== "disconnect") {
    return NextResponse.redirect(
      new URL("/settings?notice=confirmation_required", GetAppBaseUrl()),
      303,
    );
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await ResolveSessionToken(token) : null;

  if (session) {
    await DisconnectSpotifyAccount(session.userId);
  }

  const response = NextResponse.redirect(new URL("/?auth=disconnected", GetAppBaseUrl()), 303);
  ClearSessionCookie(response);
  return response;
}
