import { getLanguage } from "@/app/actions";
import OrdersClient from "./OrdersClient";
export default async function Page() {
  const lang = await getLanguage();
  return <OrdersClient lang={lang} />;
}
