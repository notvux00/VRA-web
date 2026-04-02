import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, importX509, decodeProtectedHeader } from "jose";

// Cache public keys in a global variable (per-instance)
let cachedKeys: Record<string, string> = {};
let lastFetched: number = 0;

async function getPublicKey(kid: string) {
  const now = Date.now();
  // Fetch keys every 1 hour or if kid not found
  if (now - lastFetched > 3600000 || !cachedKeys[kid]) {
    const response = await fetch("https://www.googleapis.com/identitytoolkit/v3/relyingparty/publicKeys");
    cachedKeys = await response.json();
    lastFetched = now;
  }
  const cert = cachedKeys[kid];
  if (!cert) throw new Error(`No matching key found for kid: ${kid}`);
  return await importX509(cert, "RS256");
}

export async function middleware(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  const path = request.nextUrl.pathname;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  // Paths that require auth
  const isDashboard = path.startsWith("/dashboard");

  // Paths that are auth related (login)
  const isAuthPage = path === "/";

  if (!session && isDashboard) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (session && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (session && isDashboard) {
    try {
      const { kid } = decodeProtectedHeader(session);
      if (!kid) throw new Error("No kid found in session token header");
      
      const publicKey = await getPublicKey(kid);

      // Verify the Session Cookie JWT
      // IMPORTANT: Issuer for session cookies is different from ID tokens
      const { payload } = await jwtVerify(session, publicKey, {
        issuer: `https://session.firebase.google.com/${projectId}`,
        audience: projectId,
      });

      const role = payload.role as string;

      if (!role) {
        if (path === "/dashboard") return NextResponse.next();
      }

      // Simple Role Check Routing
      if (path === "/dashboard") {
        if (role === "admin") return NextResponse.redirect(new URL("/dashboard/admin", request.url));
        if (role === "center") return NextResponse.redirect(new URL("/dashboard/center", request.url));
        if (role === "expert") return NextResponse.redirect(new URL("/dashboard/expert", request.url));
        if (role === "parent") return NextResponse.redirect(new URL("/dashboard/parent", request.url));
        
        return NextResponse.next();
      }

      // Role isolation checks
      if (path.startsWith("/dashboard/admin") && role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      if (path.startsWith("/dashboard/center") && role !== "center") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      if (path.startsWith("/dashboard/expert") && role !== "expert") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      if (path.startsWith("/dashboard/parent") && role !== "parent") {
        if (!role) return NextResponse.next(); 
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

    } catch (e) {
      console.error("Middleware Auth Error:", e);
      const response = NextResponse.redirect(new URL("/", request.url));
      response.cookies.delete("session");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/"],
};
