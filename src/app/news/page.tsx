"use client";
import { NewsList } from "@/components/blocks";
import { PageHeader, useCollection, useLang, type NewsItem } from "@/components/client";

export default function News() {
  const { t } = useLang();
  const { rows, loading } = useCollection<NewsItem>("news");
  return (
    <>
      <PageHeader title={t("newsTitle")} lead={t("newsLead")} />
      <section>
        <div className="wrap" style={{ maxWidth: 800 }}>
          {loading ? <p className="muted">{t("loading")}</p> : <NewsList rows={rows} />}
        </div>
      </section>
    </>
  );
}
