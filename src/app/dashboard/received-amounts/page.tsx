import { getLanguage } from "@/app/actions";
import { getSession } from "@/lib/server-auth";
import ReceivedAmountsClient from "./ReceivedAmountsClient";

export default async function Page() {
  const lang = await getLanguage();
  const session = await getSession();
  const role = session?.role || "user";
  return <ReceivedAmountsClient lang={lang} role={role} />;
}
