import { getLanguage } from "@/app/actions";
import { getSession } from "@/lib/server-auth";
import OrdersClient from "./OrdersClient";

export default async function Page() {
  const lang = await getLanguage();
  const session = await getSession();
  const role = session?.role || "user";
  return <OrdersClient lang={lang} role={role} />;
}
