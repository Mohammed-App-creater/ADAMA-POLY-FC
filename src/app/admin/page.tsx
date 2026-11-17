import { redirect } from "next/navigation";
import { isStaff } from "@/lib/auth";
import Dashboard from "./Dashboard";

export default async function AdminPage() {
  if (!(await isStaff())) redirect("/admin/login");
  return <Dashboard />;
}
