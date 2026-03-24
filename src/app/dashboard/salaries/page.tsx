import { getLanguage } from "@/app/actions";
import { db } from "@/db";
import { workers } from "@/db/schema";
import SalariesClient from "./SalariesClient";
export default async function Page() {
  const lang = await getLanguage();
  const workerList = await db.select({ id: workers.id, name: workers.name, salary: workers.salary }).from(workers);
  return <SalariesClient lang={lang} workers={workerList} />;
}
