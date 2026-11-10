"use client";
import { useState } from "react";
import { Lightbox, PageHeader, StatusBadge, useCollection, useLang, useRoster, type Payment } from "@/components/client";

export default function Receipts() {
  const { t } = useLang();
  const roster = useRoster();
  const { rows, loading } = useCollection<Payment>("payments");
  const [player, setPlayer] = useState("");
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const list = rows
    .filter((p) => (!player || p.playerId === player) && (!status || p.status === status))
    .sort((a, b) => b.createdAt - a.createdAt);

  return (
    <>
      <PageHeader title={t("recTitle")} lead={t("recLead")} />
      <section>
        <div className="wrap">
          <div className="bar">
            <select aria-label={t("fPlayer")} value={player} onChange={(e) => setPlayer(e.target.value)}>
              <option value="">{t("all")}</option>
              {roster.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.group})</option>)}
            </select>
            <select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">{t("all")}</option>
              {(["pending", "verified", "rejected"] as const).map((s) => <option key={s} value={s}>{t(s)}</option>)}
            </select>
          </div>
          {loading ? <p className="muted">{t("loading")}</p> : !list.length ? <p className="empty">{t("noReceipts")}</p> : (
            <div className="gal">
              {list.map((p) => (
                <div className="item" key={p.id}>
                  <button type="button" onClick={() => setOpen(p.receipt)} aria-label={`${t("fReceipt")}: ${p.playerName}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.receipt} alt="" loading="lazy" />
                  </button>
                  <div className="meta"><span>{p.playerName}</span><StatusBadge status={p.status} /></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <Lightbox src={open} onClose={() => setOpen(null)} />
    </>
  );
}
