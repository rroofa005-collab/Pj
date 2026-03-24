import { getLanguage } from "@/app/actions";
import { getSession } from "@/lib/server-auth";
import WorkersClient from "./WorkersClient";

export default async function WorkersPage() {
  const lang = await getLanguage();
  const session = await getSession();
  const role = session?.role || "user";
  return <WorkersClient lang={lang} role={role} />;
}