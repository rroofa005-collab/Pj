import { getLanguage } from "@/app/actions";
import WorkersClient from "./WorkersClient";

export default async function WorkersPage() {
  const lang = await getLanguage();
  return <WorkersClient lang={lang} />;
}
