import "server-only";

import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextResponse } from "next/server";

import { GetDatabase } from "@/db/client";
import { Sessions } from "@/db/schema";
import { GenerateOpaqueToken, HashOpaqueToken } from "@/lib/auth/crypto";

export const SESSION_COOKIE = "spotified_session";
const SESSION_DURATION_DAYS = 30;

export type CurrentSession = {
  userId: string;
  expiresAt: Date;
};

export async function CreateSession(userId: string) {
  const token = GenerateOpaqueToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);

  await GetDatabase()
    .insert(Sessions)
    .values({
      userId,
      sessionHash: HashOpaqueToken(token),
      expiresAt,
    });

  return { token, expiresAt };
}

export function SetSessionCookie(response: NextResponse, token: string, expiresAt: Date): void {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
    priority: "high",
  });
}

export function ClearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
    priority: "high",
  });
}

export async function ResolveSessionToken(token: string): Promise<CurrentSession | null> {
  const [session] = await GetDatabase()
    .select({ userId: Sessions.userId, expiresAt: Sessions.expiresAt })
    .from(Sessions)
    .where(
      and(eq(Sessions.sessionHash, HashOpaqueToken(token)), gt(Sessions.expiresAt, new Date())),
    )
    .limit(1);

  return session ?? null;
}

export async function GetCurrentSession(): Promise<CurrentSession | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  return ResolveSessionToken(token);
}

export async function RequireCurrentSession(): Promise<CurrentSession> {
  const session = await GetCurrentSession();

  if (!session) {
    redirect("/?auth=session_expired");
  }

  return session;
}

export async function DeleteSessionToken(token: string): Promise<void> {
  await GetDatabase()
    .delete(Sessions)
    .where(eq(Sessions.sessionHash, HashOpaqueToken(token)));
}

export async function DeleteCurrentSession(): Promise<void> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;

  if (token) {
    await DeleteSessionToken(token);
  }
}
