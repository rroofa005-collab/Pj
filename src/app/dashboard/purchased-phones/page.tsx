import { getLanguage } from "@/app/actions";
import PurchasedPhonesClient from "./PurchasedPhonesClient";
export default async function Page() {
  const lang = await getLanguage();
  return <PurchasedPhonesClient lang={lang} />;
}
