import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import type { CurrentUser } from "@/lib/types";
import { getPrisma } from "@/lib/server/db";
import { fail } from "@/lib/server/api-response";
import { serializeUser } from "@/lib/server/serializers";

export const SESSION_COOKIE = "oa_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

function getSessionSecret() {
  return process.env.SESSION_SECRET ?? "development-session-secret";
}

export function hashSessionToken(token: string) {
  return createHash("sha256")
    .update(`${getSessionSecret()}:${token}`)
    .digest("hex");
}

function isSameHash(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await getPrisma().session.create({
    data: {
      tokenHash,
      userId,
      expiresAt
    }
  });

  return { token, expiresAt };
}

export function attachSessionCookie(
  response: NextResponse,
  session: { token: string; expiresAt: Date }
) {
  response.cookies.set(SESSION_COOKIE, session.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: session.expiresAt
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  const tokenHash = hashSessionToken(token);
  const session = await getPrisma().session.findUnique({
    where: { tokenHash },
    include: { user: true }
  });

  if (!session || !isSameHash(session.tokenHash, tokenHash)) {
    return null;
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    await getPrisma().session.delete({ where: { id: session.id } }).catch(() => undefined);
    return null;
  }

  return serializeUser(session.user) as CurrentUser;
}

export async function destroyCurrentSession() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) {
    return;
  }

  await getPrisma()
    .session.deleteMany({
      where: {
        tokenHash: hashSessionToken(token)
      }
    })
    .catch(() => undefined);
}

export async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      user: null,
      response: fail("UNAUTHENTICATED", "请先登录管理员账号", 401)
    };
  }

  if (user.role !== "admin") {
    return {
      user: null,
      response: fail("FORBIDDEN", "当前用户无管理员权限", 403)
    };
  }

  return {
    user,
    response: null
  };
}
