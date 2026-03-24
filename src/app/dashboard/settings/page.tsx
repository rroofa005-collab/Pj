import { getLanguage } from "@/app/actions";
import { getSession } from "@/lib/server-auth";
import SettingsClient from "./SettingsClient";

export default async function Page() {
  const lang = await getLanguage();
  const session = await getSession();
  const role = session?.role || "user";
  return <SettingsClient lang={lang} role={role} />;
}