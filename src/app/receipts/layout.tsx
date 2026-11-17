import type { ReactNode } from "react";
import { noIndex } from "@/lib/site";

export const metadata = noIndex("Receipts");

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
