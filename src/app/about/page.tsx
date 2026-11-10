"use client";
import Image from "next/image";
import { CallToAction } from "@/components/blocks";
import { PageHeader, useLang } from "@/components/client";
import type { Key } from "@/lib/i18n";

const VALUES: [Key, Key][] = [["v1t", "v1"], ["v2t", "v2"], ["v3t", "v3"], ["v4t", "v4"]];

export default function About() {
  const { t } = useLang();
  return (
    <>
      <PageHeader title={t("aboutTitle")} lead={t("aboutLead")} />
      <section>
        <div className="wrap two">
          <div>
            <p style={{ fontSize: 19 }}>{t("aboutText")}</p>
            <div className="stack" style={{ marginTop: 28 }}>
              <div className="card"><h3>{t("missionT")}</h3><p>{t("mission")}</p></div>
              <div className="card"><h3>{t("visionT")}</h3><p>{t("vision")}</p></div>
            </div>
          </div>
          <div className="frame reveal"><Image src="/images/hero.jpg" alt="" width={1000} height={750} /></div>
        </div>
      </section>
      <section className="alt">
        <div className="wrap">
          <div className="sec-head"><h2>{t("valuesT")}</h2></div>
          <div className="grid">
            {VALUES.map(([title, text], i) => (
              <div className="card feature" key={title}>
                <div className="icon" aria-hidden="true">{i + 1}</div>
                <h3>{t(title)}</h3>
                <p>{t(text)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <CallToAction />
    </>
  );
}
