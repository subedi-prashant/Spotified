import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { AssertSameOrigin, InvalidRequestOriginError } from "@/lib/auth/request";
import { GetAppBaseUrl } from "@/lib/env";

export function POST(request: NextRequest): NextResponse {
  try {
    AssertSameOrigin(request);
  } catch (error) {
    if (error instanceof InvalidRequestOriginError) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    throw error;
  }

  return NextResponse.redirect(
    new URL("/api/auth/spotify/start?consent=accepted", GetAppBaseUrl()),
    303,
  );
}
