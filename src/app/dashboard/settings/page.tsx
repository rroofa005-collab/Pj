import { getLanguage } from "@/app/actions";
import SettingsClient from "./SettingsClient";
export default async function Page() {
  const lang = await getLanguage();
  return <SettingsClient lang={lang} />;
}
