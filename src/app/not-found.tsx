"use client";
import Link from "next/link";
import { useLang } from "@/components/client";

export default function NotFound() {
  const { t } = useLang();
  return (
    <section>
      <div className="wrap" style={{ textAlign: "center", padding: "60px 20px" }}>
        <div style={{ font: "800 120px/1 var(--f-d)", color: "var(--gold)" }}>404</div>
        <h1 style={{ fontSize: 44, margin: "10px 0" }}>{t("notFoundTitle")}</h1>
        <p className="muted">{t("notFoundText")}</p>
        <Link className="btn" href="/">{t("backHome")}</Link>
      </div>
    </section>
  );
}
