import { getLanguage } from "@/app/actions";
import TreasuryClient from "./TreasuryClient";
export default async function Page() {
  const lang = await getLanguage();
  return <TreasuryClient lang={lang} />;
}
