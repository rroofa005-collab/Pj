import { getSession } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import { ensureAdminExists, getLanguage } from "./actions";
import LoginClient from "./LoginClient";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Wrap in try/catch so DB errors don't crash the login page
  try {
    await ensureAdminExists();
  } catch {
    // DB not ready yet — login page still renders, user can retry
  }

  let session = null;
  try {
    session = await getSession();
  } catch {
    // ignore
  }
  if (session) redirect("/dashboard");

  let lang = "ar";
  try {
    lang = await getLanguage();
  } catch {
    // fallback to Arabic
  }

  return <LoginClient lang={lang} />;
}
