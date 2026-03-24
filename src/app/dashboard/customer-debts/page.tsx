import { getLanguage } from "@/app/actions";
import CustomerDebtsClient from "./CustomerDebtsClient";
export default async function Page() {
  const lang = await getLanguage();
  return <CustomerDebtsClient lang={lang} />;
}
