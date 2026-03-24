import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLanguage } from "../actions";
import AppLayout from "@/components/AppLayout";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/");

  const lang = await getLanguage();

  return (
    <AppLayout
      lang={lang}
      role={session.role}
      permissions={session.permissions}
      username={session.username}
    >
      {children}
    </AppLayout>
  );
}
