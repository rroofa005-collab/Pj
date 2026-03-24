import { getSession } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import { ensureAdminExists, getLanguage } from "./actions";
import LoginClient from "./LoginClient";

export default async function Home() {
  await ensureAdminExists();
  const session = await getSession();
  if (session) redirect("/dashboard");

  const lang = await getLanguage();

  return <LoginClient lang={lang} />;
}
