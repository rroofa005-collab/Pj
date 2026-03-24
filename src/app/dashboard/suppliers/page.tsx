import { getLanguage } from "@/app/actions";
import { getSession } from "@/lib/server-auth";
import SuppliersClient from "./SuppliersClient";

export default async function Page() {
  const lang = await getLanguage();
  const session = await getSession();
  const role = session?.role || "user";
  return <SuppliersClient lang={lang} role={role} />;
}
