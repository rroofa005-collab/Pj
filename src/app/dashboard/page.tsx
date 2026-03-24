import { getSession } from "@/lib/server-auth";
import { getLanguage } from "../actions";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

const FIRST_PAGES = [
  "/dashboard/workers",
  "/dashboard/suppliers",
  "/dashboard/customer-debts",
  "/dashboard/supplier-debts",
  "/dashboard/expenses",
  "/dashboard/purchased-phones",
  "/dashboard/received-amounts",
  "/dashboard/maintenance",
  "/dashboard/maintenance-tracking",
  "/dashboard/electronic-services",
  "/dashboard/orders",
  "/dashboard/installments",
  "/dashboard/salaries",
  "/dashboard/treasury",
  "/dashboard/delivery",
  "/dashboard/settings",
];

export default async function DashboardPage() {
  const session = await getSession();
  
  // Only admin can see the dashboard
  if (!session || session.role !== "admin") {
    // Check user permissions and redirect to first allowed page
    if (session?.permissions && Array.isArray(session.permissions) && session.permissions.length > 0) {
      const firstPerm = session.permissions[0];
      const redirectPage = FIRST_PAGES.find(p => p.includes(firstPerm));
      if (redirectPage) {
        redirect(redirectPage);
      }
    }
    // Default redirect for users with no specific permissions
    redirect("/dashboard/workers");
  }
  
  const lang = await getLanguage();

  return <DashboardClient lang={lang} role={session.role} />;
}