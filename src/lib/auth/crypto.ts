import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const TOKEN_VERSION = "v1";
const TOKEN_CONTEXT = Buffer.from("spotified.spotify-token.v1", "utf8");

function DecodeKey(encodedKey: string): Buffer {
  const key = Buffer.from(encodedKey, "base64url");

  if (key.length !== 32) {
    throw new Error("TOKEN_ENCRYPTION_KEY must decode to exactly 32 bytes.");
  }

  return key;
}

export function EncryptSecret(value: string, encodedKey: string): string {
  const key = DecodeKey(encodedKey);
  const initializationVector = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, initializationVector);
  cipher.setAAD(TOKEN_CONTEXT);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authenticationTag = cipher.getAuthTag();

  return [
    TOKEN_VERSION,
    initializationVector.toString("base64url"),
    ciphertext.toString("base64url"),
    authenticationTag.toString("base64url"),
  ].join(".");
}

export function DecryptSecret(value: string, encodedKey: string): string {
  const [version, encodedInitializationVector, encodedCiphertext, encodedAuthenticationTag] =
    value.split(".");

  if (
    version !== TOKEN_VERSION ||
    !encodedInitializationVector ||
    !encodedCiphertext ||
    !encodedAuthenticationTag
  ) {
    throw new Error("Encrypted secret has an invalid format.");
  }

  const decipher = createDecipheriv(
    ALGORITHM,
    DecodeKey(encodedKey),
    Buffer.from(encodedInitializationVector, "base64url"),
  );
  decipher.setAAD(TOKEN_CONTEXT);
  decipher.setAuthTag(Buffer.from(encodedAuthenticationTag, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(encodedCiphertext, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

export function GenerateOpaqueToken(byteLength = 32): string {
  return randomBytes(byteLength).toString("base64url");
}

export function HashOpaqueToken(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function SafeEqual(firstValue: string, secondValue: string): boolean {
  const firstBuffer = Buffer.from(firstValue, "utf8");
  const secondBuffer = Buffer.from(secondValue, "utf8");

  if (firstBuffer.length !== secondBuffer.length) {
    return false;
  }

  return timingSafeEqual(firstBuffer, secondBuffer);
}
