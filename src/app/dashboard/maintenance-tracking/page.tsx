import { getLanguage } from "@/app/actions";
import MaintenanceTrackingClient from "./MaintenanceTrackingClient";
export default async function Page() {
  const lang = await getLanguage();
  return <MaintenanceTrackingClient lang={lang} />;
}
