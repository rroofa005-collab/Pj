import { getLanguage } from "@/app/actions";
import { getSession } from "@/lib/server-auth";
import AttendanceClient from "./AttendanceClient";

export default async function Page() {
  const lang = await getLanguage();
  const session = await getSession();
  const role = session?.role || "user";
  const userId = session?.id ?? 0;
  const username = session?.username ?? "";
  return <AttendanceClient lang={lang} role={role} userId={userId} username={username} />;
}
