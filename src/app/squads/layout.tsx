import type { ReactNode } from "react";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta("/squads");

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
