import { getLanguage } from "@/app/actions";
import { db } from "@/db";
import { workers } from "@/db/schema";
import InstallmentsClient from "./InstallmentsClient";
export default async function Page() {
  const lang = await getLanguage();
  const workerList = await db.select({ id: workers.id, name: workers.name }).from(workers);
  return <InstallmentsClient lang={lang} workers={workerList} />;
}
