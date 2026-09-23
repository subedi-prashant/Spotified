import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { AssertSameOrigin, InvalidRequestOriginError } from "@/lib/auth/request";
import { ClearSessionCookie, DeleteSessionToken, SESSION_COOKIE } from "@/lib/auth/session";
import { GetAppBaseUrl } from "@/lib/env";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    AssertSameOrigin(request);
  } catch (error) {
    if (error instanceof InvalidRequestOriginError) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    throw error;
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (token) {
    await DeleteSessionToken(token);
  }

  const response = NextResponse.redirect(new URL("/?auth=signed_out", GetAppBaseUrl()), 303);
  ClearSessionCookie(response);
  return response;
}
