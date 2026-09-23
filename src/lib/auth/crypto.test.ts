import { describe, expect, it } from "vitest";

import {
  DecryptSecret,
  EncryptSecret,
  GenerateOpaqueToken,
  HashOpaqueToken,
  SafeEqual,
} from "@/lib/auth/crypto";

const ENCRYPTION_KEY = Buffer.alloc(32, 17).toString("base64url");

describe("token cryptography", () => {
  it("encrypts and decrypts a secret without storing plaintext", () => {
    const encrypted = EncryptSecret("spotify-token-value", ENCRYPTION_KEY);

    expect(encrypted).not.toContain("spotify-token-value");
    expect(DecryptSecret(encrypted, ENCRYPTION_KEY)).toBe("spotify-token-value");
  });

  it("rejects a modified authentication tag", () => {
    const encrypted = EncryptSecret("spotify-token-value", ENCRYPTION_KEY);
    const segments = encrypted.split(".");
    segments[3] = Buffer.alloc(16, 4).toString("base64url");

    expect(() => DecryptSecret(segments.join("."), ENCRYPTION_KEY)).toThrow();
  });

  it("requires a 32-byte encryption key", () => {
    expect(() => EncryptSecret("value", Buffer.alloc(16).toString("base64url"))).toThrow(
      "exactly 32 bytes",
    );
  });

  it("creates high-entropy opaque tokens and stable hashes", () => {
    const firstToken = GenerateOpaqueToken();
    const secondToken = GenerateOpaqueToken();

    expect(firstToken).not.toBe(secondToken);
    expect(firstToken.length).toBeGreaterThanOrEqual(43);
    expect(HashOpaqueToken(firstToken)).toHaveLength(64);
    expect(HashOpaqueToken(firstToken)).toBe(HashOpaqueToken(firstToken));
  });

  it("compares state values safely", () => {
    expect(SafeEqual("expected-state", "expected-state")).toBe(true);
    expect(SafeEqual("expected-state", "different-state")).toBe(false);
    expect(SafeEqual("short", "a-much-longer-value")).toBe(false);
  });
});
