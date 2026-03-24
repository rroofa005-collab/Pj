import { getLanguage } from "@/app/actions";
import SupplierDebtsClient from "./SupplierDebtsClient";
export default async function Page() {
  const lang = await getLanguage();
  return <SupplierDebtsClient lang={lang} />;
}
