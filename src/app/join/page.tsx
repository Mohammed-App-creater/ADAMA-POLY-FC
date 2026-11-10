"use client";
import { useState, type FormEvent } from "react";
import { Notice, PageHeader, api, useLang } from "@/components/client";
import { ALL_GROUPS } from "@/lib/data";

export default function Join() {
  const { t } = useLang();
  const [state, setState] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    if (Object.values(data).some((v) => !String(v).trim())) return setState({ ok: false, text: t("errFields") });
    setBusy(true);
    try {
      await api("POST", "/api/players", { ...data, age: Number(data.age) });
      setState({ ok: true, text: t("savedReg") });
      form.reset();
    } catch (x) {
      setState({ ok: false, text: (x as Error).message || t("errSave") });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader title={t("joinTitle")} lead={t("joinLead")} />
      <section>
        <div className="wrap two">
          <div>
            <h2 className="title">{t("joinNext")}</h2>
            <ol className="steps">
              <li><b>{t("jn1")}</b></li>
              <li><b>{t("jn2")}</b></li>
              <li><b>{t("jn3")}</b></li>
            </ol>
          </div>
          <form className="card" onSubmit={submit} noValidate>
            <label htmlFor="name" style={{ marginTop: 0 }}>{t("fName")}</label>
            <input id="name" name="name" required autoComplete="off" />
            <div className="row">
              <div><label htmlFor="age">{t("fAge")}</label><input id="age" name="age" type="number" min={5} max={40} inputMode="numeric" required /></div>
              <div><label htmlFor="group">{t("fGroup")}</label><select id="group" name="group">{ALL_GROUPS.map((g) => <option key={g}>{g}</option>)}</select></div>
            </div>
            <label htmlFor="studentId">{t("fStudentId")}</label>
            <input id="studentId" name="studentId" required autoComplete="off" />
            <label htmlFor="parent">{t("fParent")}</label>
            <input id="parent" name="parent" required autoComplete="name" />
            <label htmlFor="phone">{t("fPhone")}</label>
            <input id="phone" name="phone" type="tel" required autoComplete="tel" />
            <button className="btn" type="submit" disabled={busy}>{busy ? t("sending") : t("btnSend")}</button>
            <Notice state={state} />
          </form>
        </div>
      </section>
    </>
  );
}
