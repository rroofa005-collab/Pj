import { getLanguage } from "@/app/actions";
import ReceivedAmountsClient from "./ReceivedAmountsClient";
export default async function Page() {
  const lang = await getLanguage();
  return <ReceivedAmountsClient lang={lang} />;
}
