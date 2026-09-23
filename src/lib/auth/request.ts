import type { NextRequest } from "next/server";

import { GetAppBaseUrl } from "@/lib/env";

export class InvalidRequestOriginError extends Error {
  public constructor() {
    super("The request origin could not be verified.");
    this.name = "InvalidRequestOriginError";
  }
}

export function AssertSameOrigin(request: NextRequest): void {
  const origin = request.headers.get("origin");

  if (!origin) {
    throw new InvalidRequestOriginError();
  }

  let requestOrigin: string;

  try {
    requestOrigin = new URL(origin).origin;
  } catch {
    throw new InvalidRequestOriginError();
  }

  if (requestOrigin !== new URL(GetAppBaseUrl()).origin) {
    throw new InvalidRequestOriginError();
  }
}
