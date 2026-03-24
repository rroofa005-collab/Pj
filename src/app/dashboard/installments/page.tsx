import { getLanguage } from "@/app/actions";
import { getSession } from "@/lib/server-auth";
import { db } from "@/db";
import { workers } from "@/db/schema";
import InstallmentsClient from "./InstallmentsClient";

export default async function Page() {
  const lang = await getLanguage();
  const session = await getSession();
  const role = session?.role || "user";
  const workerList = await db.select({ id: workers.id, name: workers.name }).from(workers);
  return <InstallmentsClient lang={lang} role={role} workers={workerList} />;
}
