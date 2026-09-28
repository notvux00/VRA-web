import "server-only";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";
import type { DecodedIdToken } from "firebase-admin/auth";

export type SessionClaims = DecodedIdToken & { role?: string; centerId?: string };

/**
 * Verifies the session cookie and returns the decoded claims.
 * Throws an error if the session is missing or invalid.
 * Use this at the top of sensitive Server Actions.
 */
export async function requireSession(): Promise<SessionClaims> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) {
    throw new Error("Unauthorized: No session");
  }

  try {
    const claims = await adminAuth.verifySessionCookie(sessionCookie, true);
    return claims as SessionClaims;
  } catch {
    throw new Error("Unauthorized: Invalid session");
  }
}

/**
 * Verifies session AND checks for a required role.
 * Throws if the user is not authenticated or lacks the role.
 */
export async function requireRole(
  ...allowedRoles: string[]
): Promise<SessionClaims> {
  const claims = await requireSession();
  const role = claims.role ?? "";

  if (!allowedRoles.includes(role)) {
    throw new Error(`Forbidden: requires role [${allowedRoles.join("|")}], got "${role}"`);
  }

  return claims;
}
