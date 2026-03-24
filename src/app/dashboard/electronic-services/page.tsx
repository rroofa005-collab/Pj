import { getLanguage } from "@/app/actions";
import ElectronicServicesClient from "./ElectronicServicesClient";
export default async function Page() {
  const lang = await getLanguage();
  return <ElectronicServicesClient lang={lang} />;
}
