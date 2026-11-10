"use client";
import { CallToAction, ProgramCards } from "@/components/blocks";
import { PageHeader, useLang } from "@/components/client";
import { SCHEDULE } from "@/lib/data";

export default function Programs() {
  const { t } = useLang();
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
              <tbody>{SCHEDULE.map((s) => <tr key={s.group}><td>{s.group}</td><td>{s.days}</td><td>{s.time}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      </section>
      <CallToAction />
    </>
  );
}
