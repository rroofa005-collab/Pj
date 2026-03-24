import { getLanguage } from "@/app/actions";
import { getSession } from "@/lib/server-auth";
import TreasuryClient from "./TreasuryClient";

export default async function Page() {
  const lang = await getLanguage();
  const session = await getSession();
  const role = session?.role || "user";
  return <TreasuryClient lang={lang} role={role} />;
}
