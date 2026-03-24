import { getLanguage } from "@/app/actions";
import { getSession } from "@/lib/server-auth";
import CustomerDebtsClient from "./CustomerDebtsClient";

export default async function Page() {
  const lang = await getLanguage();
  const session = await getSession();
  const role = session?.role || "user";
  return <CustomerDebtsClient lang={lang} role={role} />;
}
