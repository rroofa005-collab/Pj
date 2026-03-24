import { getLanguage } from "@/app/actions";
import { getSession } from "@/lib/server-auth";
import MaintenanceTrackingClient from "./MaintenanceTrackingClient";

export default async function Page() {
  const lang = await getLanguage();
  const session = await getSession();
  const role = session?.role || "user";
  return <MaintenanceTrackingClient lang={lang} role={role} />;
}