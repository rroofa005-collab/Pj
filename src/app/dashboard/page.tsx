import { getSession } from "@/lib/server-auth";
import { getLanguage } from "../actions";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getSession();
  const lang = await getLanguage();

  return <DashboardClient lang={lang} role={session?.role || "user"} />;
}
