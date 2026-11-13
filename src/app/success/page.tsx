"use client";
import { CallToAction, StoryCards } from "@/components/blocks";
import { PageHeader, useCollection, useLang, type Story } from "@/components/client";

// Players from the academy who reached a club, a national team or another big step.
export default function Success() {
  const { t } = useLang();
  const { rows, loading } = useCollection<Story>("stories");
  return (
    <>
      <PageHeader title={t("successTitle")} lead={t("successLead")} />
      <section>
        <div className="wrap">
          {loading ? <p className="muted">{t("loading")}</p> : rows.length ? <StoryCards rows={rows} /> : <p className="empty">{t("noSuccess")}</p>}
        </div>
      </section>
      <CallToAction />
    </>
  );
}
