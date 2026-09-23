import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it } from "vitest";

import { AssertSameOrigin, InvalidRequestOriginError } from "@/lib/auth/request";

describe("same-origin request protection", () => {
  beforeEach(() => {
    process.env.APP_BASE_URL = "https://spotified.example";
  });

  it("accepts the configured application origin", () => {
    const request = new NextRequest("https://spotified.example/api/auth/logout", {
      method: "POST",
      headers: { origin: "https://spotified.example" },
    });

    expect(() => AssertSameOrigin(request)).not.toThrow();
  });

  it("rejects another origin even when the request host is attacker-controlled", () => {
    const request = new NextRequest("https://attacker.example/api/auth/logout", {
      method: "POST",
      headers: { origin: "https://attacker.example" },
    });

    expect(() => AssertSameOrigin(request)).toThrow(InvalidRequestOriginError);
  });

  it("rejects missing and malformed origins", () => {
    const missingOrigin = new NextRequest("https://spotified.example/api/auth/logout", {
      method: "POST",
    });
    const malformedOrigin = new NextRequest("https://spotified.example/api/auth/logout", {
      method: "POST",
      headers: { origin: "not a URL" },
    });

    expect(() => AssertSameOrigin(missingOrigin)).toThrow(InvalidRequestOriginError);
    expect(() => AssertSameOrigin(malformedOrigin)).toThrow(InvalidRequestOriginError);
  });
});
