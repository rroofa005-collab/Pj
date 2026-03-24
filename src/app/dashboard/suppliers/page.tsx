import { getLanguage } from "@/app/actions";
import SuppliersClient from "./SuppliersClient";
export default async function Page() {
  const lang = await getLanguage();
  return <SuppliersClient lang={lang} />;
}
