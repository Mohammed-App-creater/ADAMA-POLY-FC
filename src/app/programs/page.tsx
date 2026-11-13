"use client";
import { CallToAction, ProgramCards } from "@/components/blocks";
import { PageHeader, useCollection, useLang, type TrainingTime } from "@/components/client";

export default function Programs() {
  const { t } = useLang();
  const times = useCollection<TrainingTime>("schedule").rows;
  return (
    <>
      <PageHeader title={t("programsTitle")} lead={t("programsLead")} />
      <section>
        <div className="wrap"><ProgramCards /></div>
      </section>
      <section className="alt">
        <div className="wrap two">
          <div>
            <h2 className="title">{t("schedTitle")}</h2>
            <p className="lead">{t("schedLead")}</p>
          </div>
          <div className="scroll">
            <table className="tbl">
              <thead><tr><th>{t("thGroup")}</th><th>{t("thDays")}</th><th>{t("thTime")}</th></tr></thead>
              <tbody>{times.map((s) => <tr key={s.id}><td>{s.group}</td><td>{s.days}</td><td>{s.time}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      </section>
      <CallToAction />
    </>
  );
}
