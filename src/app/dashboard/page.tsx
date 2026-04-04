import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth } from "@/lib/firebase/admin";

const SESSION_COOKIE_NAME = "session";

export default async function DashboardPage() {
  const sessionCookie = (await cookies()).get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    redirect("/");
  }

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie);
    const role = decodedClaims.role;

    if (role === "admin") redirect("/dashboard/admin");
    if (role === "center") redirect("/dashboard/center");
    if (role === "expert" || role === "therapist") redirect("/dashboard/expert");
    if (role === "parent") redirect("/dashboard/parent");

    // Fallback if role is not found yet (e.g. sync delay)
    // Instead of a black screen, we show a clean loading state consistent with layout
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-zinc-500 dark:text-zinc-400">Đang chuẩn bị không gian làm việc của bạn...</p>
      </div>
    );
  } catch (e) {
    redirect("/");
  }
}
