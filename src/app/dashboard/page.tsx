import { getSession } from "@/lib/server-auth";
import { getLanguage } from "../actions";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/");

  const lang = await getLanguage();

  return (
    <DashboardClient
      lang={lang}
      role={session.role}
      permissions={session.permissions ?? []}
    />
  );
}
