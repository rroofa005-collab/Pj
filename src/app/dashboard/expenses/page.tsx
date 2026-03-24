import { getLanguage } from "@/app/actions";
import { getSession } from "@/lib/server-auth";
import ExpensesClient from "./ExpensesClient";

export default async function Page() {
  const lang = await getLanguage();
  const session = await getSession();
  const role = session?.role || "user";
  return <ExpensesClient lang={lang} role={role} />;
}
