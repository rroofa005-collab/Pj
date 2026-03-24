import { getLanguage } from "@/app/actions";
import { getSession } from "@/lib/server-auth";
import ElectronicServicesClient from "./ElectronicServicesClient";

export default async function Page() {
  const lang = await getLanguage();
  const session = await getSession();
  const role = session?.role || "user";
  return <ElectronicServicesClient lang={lang} role={role} />;
}