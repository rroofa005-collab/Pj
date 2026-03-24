import { getLanguage } from "@/app/actions";
import { getSession } from "@/lib/server-auth";
import SupplierDebtsClient from "./SupplierDebtsClient";

export default async function Page() {
  const lang = await getLanguage();
  const session = await getSession();
  const role = session?.role || "user";
  return <SupplierDebtsClient lang={lang} role={role} />;
}
