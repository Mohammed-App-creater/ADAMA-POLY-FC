import { isStaff } from "@/lib/auth";
import { list } from "@/lib/db";

export async function GET() {
  if (!(await isStaff())) return new Response("Staff only", { status: 401 });
  const players = await list("players");
  const cell = (v: unknown) => {
    let s = String(v ?? "");
    if (/^[=+\-@]/.test(s)) s = "'" + s; // stop spreadsheet apps running it as a formula
    return `"${s.replace(/"/g, '""')}"`;
  };
  const cols = ["name", "age", "group", "studentId", "parent", "phone", "status"];
  const csv = [cols.join(",")].concat(players.map((p) => cols.map((c) => cell(p[c])).join(","))).join("\n");
  return new Response("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="adama-poly-players.csv"',
    },
  });
}
