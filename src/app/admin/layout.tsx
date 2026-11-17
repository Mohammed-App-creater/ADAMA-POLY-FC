import type { ReactNode } from "react";
import { noIndex } from "@/lib/site";

export const metadata = noIndex("Staff");

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
