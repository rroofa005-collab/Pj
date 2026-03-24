import { getLanguage } from "@/app/actions";
import ExpensesClient from "./ExpensesClient";
export default async function Page() {
  const lang = await getLanguage();
  return <ExpensesClient lang={lang} />;
}
