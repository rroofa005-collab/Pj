import { getSession } from "@/lib/server-auth";
import { getLanguage } from "../actions";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getSession();
  
  // Only admin can see the dashboard
  if (!session || session.role !== "admin") {
    redirect("/dashboard/workers");
  }
  
  const lang = await getLanguage();

  return <DashboardClient lang={lang} role={session.role} />;
}