"use client";
import { useState, type FormEvent } from "react";
import { Notice, PageHeader, api, useLang } from "@/components/client";
import { CONTACT } from "@/lib/data";
import type { Key } from "@/lib/i18n";

const FAQ: [Key, Key][] = [["q1", "a1"], ["q2", "a2"], ["q3", "a3"], ["q4", "a4"]];

export default function Contact() {
  const { t } = useLang();
  const [state, setState] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    if (!String(data.name).trim() || !String(data.message).trim()) return setState({ ok: false, text: t("errFields") });
    setBusy(true);
    try {
      await api("POST", "/api/messages", data);
      setState({ ok: true, text: t("savedMsg") });
      form.reset();
    } catch (x) {
      setState({ ok: false, text: (x as Error).message || t("errSave") });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader title={t("contactTitle")} lead={t("contactLead")} />
      <section>
        <div className="wrap two">
          <div>
            <ul className="info" style={{ marginTop: 0 }}>
              <li><b>{t("cPhone")}</b>{CONTACT.phone}</li>
              <li><b>{t("cEmail")}</b>{CONTACT.email}</li>
              <li><b>{t("cAddress")}</b>{CONTACT.address}</li>
              <li><b>{t("cHours")}</b>{t("hoursText")}</li>
            </ul>
            <h3 className="sub">{t("faqTitle")}</h3>
            {FAQ.map(([q, a]) => (
              <details className="faq" key={q}><summary>{t(q)}</summary><p>{t(a)}</p></details>
            ))}
          </div>
          <form className="card" onSubmit={submit} noValidate>
            <label htmlFor="name" style={{ marginTop: 0 }}>{t("fYourName")}</label>
            <input id="name" name="name" required autoComplete="name" />
            <div className="row">
              <div><label htmlFor="phone">{t("fPhone")}</label><input id="phone" name="phone" type="tel" autoComplete="tel" /></div>
              <div><label htmlFor="email">{t("fEmail")}</label><input id="email" name="email" type="email" autoComplete="email" /></div>
            </div>
            <label htmlFor="message">{t("fMessage")}</label>
            <textarea id="message" name="message" required maxLength={2000} />
            <button className="btn" type="submit" disabled={busy}>{busy ? t("sending") : t("btnSendMsg")}</button>
            <Notice state={state} />
          </form>
        </div>
      </section>
    </>
  );
}
