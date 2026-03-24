import { getLanguage } from "@/app/actions";
import DeliveryClient from "./DeliveryClient";
export default async function Page() {
  const lang = await getLanguage();
  return <DeliveryClient lang={lang} />;
}
