import { getLanguage } from "@/app/actions";
import MaintenanceClient from "./MaintenanceClient";
export default async function Page() {
  const lang = await getLanguage();
  return <MaintenanceClient lang={lang} />;
}
