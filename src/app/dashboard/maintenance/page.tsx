import { getLanguage } from "@/app/actions";
import { getSession } from "@/lib/server-auth";
import MaintenanceClient from "./MaintenanceClient";

export default async function Page() {
  const lang = await getLanguage();
  const session = await getSession();
  const role = session?.role || "user";
  return <MaintenanceClient lang={lang} role={role} />;
}
