import { getSession } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import { getLanguage } from "@/app/actions";
import ExternalMaintenanceClient from "./ExternalMaintenanceClient";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await getSession();
  if (!session) redirect("/");
  const lang = await getLanguage();
  return <ExternalMaintenanceClient lang={lang} role={session.role} />;
}