import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";
import ClientLayout from "./ClientLayout";

const SESSION_COOKIE_NAME = "session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    throw new Error("Unauthorized: No session");
  }

  try {
    // Xác thực token hợp lệ không
    await adminAuth.verifySessionCookie(sessionCookie);
  } catch (error) {
    throw new Error("Unauthorized: Invalid session");
  }

  // Pass qua Client Layout
  return <ClientLayout>{children}</ClientLayout>;
}
