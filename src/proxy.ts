import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, importX509, decodeProtectedHeader } from "jose";

let cachedKeys: Record<string, string> = {};
let lastFetched = 0;

async function getPublicKey(kid: string) {
  const now = Date.now();

  if (now - lastFetched > 3600000 || !cachedKeys[kid]) {
    const response = await fetch("https://www.googleapis.com/identitytoolkit/v3/relyingparty/publicKeys");
    cachedKeys = await response.json();
    lastFetched = now;
  }

  const cert = cachedKeys[kid];
  if (!cert) throw new Error(`No matching key found for kid: ${kid}`);

  return importX509(cert, "RS256");
}

function redirectTo(path: string, request: NextRequest) {
  return NextResponse.redirect(new URL(path, request.url));
}

export async function proxy(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  const path = request.nextUrl.pathname;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  const isDashboard = path.startsWith("/dashboard");
  const isAuthPage = path === "/";

  if (!session && isDashboard) {
    return redirectTo("/", request);
  }

  if (session && isAuthPage) {
    return redirectTo("/dashboard", request);
  }

  if (!session || !isDashboard) {
    return NextResponse.next();
  }

  try {
    const { kid } = decodeProtectedHeader(session);
    if (!kid) throw new Error("No kid found in session token header");

    const publicKey = await getPublicKey(kid);
    const { payload } = await jwtVerify(session, publicKey, {
      issuer: `https://session.firebase.google.com/${projectId}`,
      audience: projectId,
    });

    const role = payload.role as string | undefined;

    if (path === "/dashboard") {
      if (role === "admin") return redirectTo("/dashboard/admin", request);
      if (role === "center") return redirectTo("/dashboard/center", request);
      if (role === "expert") return redirectTo("/dashboard/expert", request);
      if (role === "parent") return redirectTo("/dashboard/parent", request);

      return NextResponse.next();
    }

    const routeRoles = [
      { role: "admin", root: "/dashboard/admin" },
      { role: "center", root: "/dashboard/center" },
      { role: "expert", root: "/dashboard/expert" },
      { role: "parent", root: "/dashboard/parent" },
    ] as const;

    const routeRole = routeRoles.find(({ root }) => path.startsWith(root))?.role;
    if (routeRole && role !== routeRole) {
      if (routeRole === "parent" && !role) return NextResponse.next();
      return redirectTo("/dashboard", request);
    }
  } catch (error) {
    console.error("Proxy Auth Error:", error);
    const response = redirectTo("/", request);
    response.cookies.delete("session");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/"],
};
