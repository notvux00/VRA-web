import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  const path = request.nextUrl.pathname;

  // Paths that require auth
  const isDashboard = path.startsWith("/dashboard");

  // Paths that are auth related (login)
  const isAuthPage = path === "/";

  if (!session && isDashboard) {
    // Not logged in, trying to access protected route -> redirect to login
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (session && isAuthPage) {
    // Logged in, trying to access login/register -> redirect to dashboard (we will figure out WHICH dashboard based on role later, or just /dashboard)
    // For now, redirecting to /dashboard.
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // To truly route based on roles, you'd decode the JWT session cookie here.
  // Next.js middleware runs on the Edge, so we can't use full firebase-admin.
  // BUT we can decode the base64 payload of the JWT manually to check the role claim!

  if (session && isDashboard) {
    try {
      // Decode the JWT securely or inspect the payload to get the role.
      // Firebase session cookies are JWTs.
      const payloadBase64 = session.split(".")[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));
      
      const role = decodedPayload.role; // Custom claim

      // If no role is found yet (propagation delay), don't redirect yet or default to parent
      if (!role) {
        console.log("No role found in token yet, allowing through or defaulting to parent...");
        // If they are specifically at /dashboard, and no role, let them stay or redirect to a loading/setup page
        if (path === "/dashboard") return NextResponse.next();
      }

      // Simple Role Check Routing
      if (path === "/dashboard") {
        if (role === "admin") return NextResponse.redirect(new URL("/dashboard/admin", request.url));
        if (role === "center") return NextResponse.redirect(new URL("/dashboard/center", request.url));
        if (role === "expert") return NextResponse.redirect(new URL("/dashboard/expert", request.url));
        if (role === "parent") return NextResponse.redirect(new URL("/dashboard/parent", request.url));
        
        // Default fallback if no role matched
        return NextResponse.next();
      }

      // If they try to access a specific dashboard without the role
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
        // Special case: if it's a new user, the role might take a second to propagate. 
        // If they are on the parent dashboard, don't kick them out immediately if role is missing.
        if (!role) return NextResponse.next(); 
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

    } catch (e) {
      // Invalid session cookie format
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
