import { getLanguage } from "@/app/actions";
import { getSession } from "@/lib/server-auth";
import DeliveryClient from "./DeliveryClient";

export default async function Page() {
  const lang = await getLanguage();
  const session = await getSession();
  const role = session?.role || "user";
  return <DeliveryClient lang={lang} role={role} />;
}
