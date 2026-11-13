"use client";
import { FixtureList, resultsOf, upcomingOf } from "@/components/blocks";
import { PageHeader, useCollection, useLang, type Fixture, type TrainingTime } from "@/components/client";

export default function Schedule() {
  const { t } = useLang();
  const { rows } = useCollection<Fixture>("fixtures");
  const times = useCollection<TrainingTime>("schedule").rows;
  return (
    <>
      <PageHeader title={t("schedTitle")} lead={t("schedLead")} />
      <section>
        <div className="wrap">
          <div className="scroll">
            <table className="tbl">
              <thead><tr><th>{t("thGroup")}</th><th>{t("thDays")}</th><th>{t("thTime")}</th></tr></thead>
              <tbody>{times.map((s) => <tr key={s.id}><td>{s.group}</td><td>{s.days}</td><td>{s.time}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      </section>
      <section className="alt">
        <div className="wrap">
          <div className="sec-head">
            <div><h2>{t("fixTitle")}</h2><p className="lead">{t("fixLead")}</p></div>
          </div>
          <div className="two">
            <div><h3 className="sub" style={{ marginTop: 0 }}>{t("upcoming")}</h3><FixtureList rows={upcomingOf(rows)} /></div>
            <div><h3 className="sub" style={{ marginTop: 0 }}>{t("results")}</h3><FixtureList rows={resultsOf(rows)} /></div>
          </div>
        </div>
      </section>
    </>
  );
}
