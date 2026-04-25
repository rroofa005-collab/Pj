import { getSession } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import { getLanguage } from "@/app/actions";
import MaintenanceInstallmentsClient from "./MaintenanceInstallmentsClient";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await getSession();
  if (!session) redirect("/");
  const lang = await getLanguage();
  return <MaintenanceInstallmentsClient lang={lang} role={session.role} />;
}