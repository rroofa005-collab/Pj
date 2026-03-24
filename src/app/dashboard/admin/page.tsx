import { getLanguage } from "@/app/actions";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminClient from "./AdminClient";

export default async function Page() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/dashboard");
  const lang = await getLanguage();
  return <AdminClient lang={lang} />;
}
