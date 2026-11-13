"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Notice, PageHeader, api, compressImage, useLang, useRoster, useSettings } from "@/components/client";
import { ALL_GROUPS } from "@/lib/data";

export default function Pay() {
  const { t } = useLang();
  const roster = useRoster();
  const { settings } = useSettings();
  const [group, setGroup] = useState<string>("U10");
  const [playerId, setPlayerId] = useState("");
  const [state, setState] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const file = (form.elements.namedItem("file") as HTMLInputElement).files?.[0];
    const player = roster.find((p) => p.id === playerId);
    if (!player || !file) return setState({ ok: false, text: t("errReq") });
    setBusy(true);
    try {
      const receipt = await compressImage(file);
      await api("POST", "/api/payments", { playerId: player.id, playerName: player.name, group: player.group, receipt });
      setState({ ok: true, text: t("savedPay") });
      form.reset();
      setPlayerId("");
    } catch (x) {
      setState({ ok: false, text: (x as Error).message || t("errSave") });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader title={t("payTitle")} lead={t("payLead")} />
      <section>
        <div className="wrap two">
          <div>
            <ol className="steps" style={{ marginTop: 0 }}>
              <li><b>{t("step1")}</b><span>{t("step1d")}</span></li>
              <li><b>{t("step2")}</b><span>{t("step2d")}</span></li>
              <li><b>{t("step3")}</b><span>{t("step3d")}</span></li>
            </ol>
            {settings.bankAccount && <p><b>{t("bankAccount")}:</b> {settings.bankAccount}</p>}
            <p className="muted">{t("payNote")} <Link className="link" href="/join">{t("btnRegister")} →</Link></p>
          </div>
          <form className="card" onSubmit={submit} noValidate>
            <label htmlFor="group" style={{ marginTop: 0 }}>{t("fGroup")}</label>
            <select id="group" value={group} onChange={(e) => { setGroup(e.target.value); setPlayerId(""); }}>
              {ALL_GROUPS.map((g) => <option key={g}>{g}</option>)}
            </select>
            <label htmlFor="player">{t("fPlayer")}</label>
            <select id="player" value={playerId} onChange={(e) => setPlayerId(e.target.value)} required>
              <option value="">{t("choose")}</option>
              {roster.filter((p) => p.group === group).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <label htmlFor="file">{t("fReceipt")}</label>
            <input id="file" name="file" type="file" accept="image/*" required />
            <button className="btn" type="submit" disabled={busy}>{busy ? t("sending") : t("btnPay")}</button>
            <Notice state={state} />
          </form>
        </div>
      </section>
    </>
  );
}
