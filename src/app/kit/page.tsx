"use client";
import { KitCards } from "@/components/blocks";
import { PageHeader, useLang } from "@/components/client";
import { SIZES } from "@/lib/data";

export default function Kit() {
  const { t } = useLang();
  return (
    <>
      <PageHeader title={t("kitTitle")} lead={t("kitLead")} />
      <section className="alt">
        <div className="wrap"><KitCards /></div>
      </section>
      <section>
        <div className="wrap two mid">
          <div className="sec-head" style={{ marginBottom: 0 }}><h2>{t("sizes")}</h2></div>
          <div className="scroll">
            <table className="tbl">
              <thead><tr><th>{t("thSize")}</th><th>{t("thAge")}</th></tr></thead>
              <tbody>{SIZES.map(([s, a]) => <tr key={s}><td>{s}</td><td>{a}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
