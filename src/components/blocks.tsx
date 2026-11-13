"use client";
// Content blocks reused on more than one page.
import Link from "next/link";
import { KITS, PROGRAMS, type KitDesign } from "@/lib/data";
import { fmtDate, useCollection, useLang, type Fixture, type NewsItem, type TrainingTime } from "./client";

export function ProgramCards() {
  const { t } = useLang();
  const times = useCollection<TrainingTime>("schedule").rows;
  return (
    <div className="grid">
      {PROGRAMS.map((p) => {
        const s = times.find((x) => x.group === p.group);
        return (
          <article className="card lift prog" key={p.group}>
            <div className="big">{p.group}</div>
            <div className="tagline">{t(p.age)}</div>
            <p>{t(p.text)}</p>
            <div className="meta">
              <span>{t("trainsOn")}: {s?.days}</span>
              <Link className="link" href={`/squads?group=${p.group}`}>{t("viewSquad")} →</Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}

const today = () => new Date().toISOString().slice(0, 10);
const played = (f: Fixture) => f.scoreUs !== "" && f.scoreThem !== "";
export const upcomingOf = (rows: Fixture[]) =>
  rows.filter((f) => !played(f) && f.date >= today()).sort((a, b) => a.date.localeCompare(b.date));
export const resultsOf = (rows: Fixture[]) =>
  rows.filter((f) => played(f) || f.date < today()).sort((a, b) => b.date.localeCompare(a.date));

export function FixtureList({ rows }: { rows: Fixture[] }) {
  const { t, lang } = useLang();
  if (!rows.length) return <p className="empty">{t("noFixtures")}</p>;
  return (
    <div>
      {rows.map((f) => (
        <div className="card fx" key={f.id}>
          <div className="date">{fmtDate(f.date, lang)}</div>
          <div className="teams">
            {f.group} {t("vs")} {f.opponent}
            <small>{[f.time, f.venue, f.competition].filter(Boolean).join(" · ")}</small>
          </div>
          {played(f)
            ? <div className="score">{f.scoreUs} – {f.scoreThem}</div>
            : <span className="badge b-new">{t(f.side === "away" ? "away" : "home")}</span>}
        </div>
      ))}
    </div>
  );
}

export function NewsList({ rows, limit }: { rows: NewsItem[]; limit?: number }) {
  const { t, lang } = useLang();
  const list = [...rows].sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
  if (!list.length) return <p className="empty">{t("noNews")}</p>;
  return (
    <div className="stack">
      {list.map((n) => (
        <article className="card news-item" key={n.id}>
          <time dateTime={n.date}>{fmtDate(n.date, lang)}</time>
          <h3>{n.title}</h3>
          <p>{limit && n.body.length > 180 ? n.body.slice(0, 180).trimEnd() + "…" : n.body}</p>
        </article>
      ))}
    </div>
  );
}

/** Full kit drawing: shirt with shoulder panel and crest, shorts and hooped socks. */
export function KitSvg({ kit, label, number = "10" }: { kit: KitDesign; label: string; number?: string }) {
  const id = kit.name;
  const shirt = "M78 20 40 34 8 80l32 26 18-16v108h124V90l18 16 32-26-32-46-38-14q-42 30-84 0Z";
  return (
    <svg viewBox="0 0 240 384" role="img" aria-label={label}>
      <defs>
        <clipPath id={`${id}-c`}><path d={shirt} /></clipPath>
        <linearGradient id={`${id}-g`} x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity=".28" /><stop offset=".22" stopColor="#fff" stopOpacity=".1" />
          <stop offset=".5" stopColor="#fff" stopOpacity="0" /><stop offset=".8" stopColor="#000" stopOpacity=".06" />
          <stop offset="1" stopColor="#000" stopOpacity=".3" />
        </linearGradient>
      </defs>
      {/* socks */}
      {[66, 144].map((x) => (
        <g key={x}>
          <rect x={x} y="296" width="30" height="80" rx="7" fill={kit.socks} stroke="#0008" />
          <rect x={x} y="306" width="30" height="9" fill={kit.hoop} /><rect x={x} y="324" width="30" height="9" fill={kit.hoop} />
        </g>
      ))}
      {/* shorts */}
      <path d="M60 204h120l12 82h-62l-10-34-10 34H48Z" fill={kit.shorts} stroke="#0008" strokeLinejoin="round" />
      <path d="M60 204 48 286h10l11-82Zm120 0 12 82h-10l-11-82Z" fill={kit.shortsTrim} />
      <path d="M60 204h120v10H60Z" fill="#000" opacity=".18" />
      {/* shirt */}
      <path d={shirt} fill={kit.body} />
      <g clipPath={`url(#${id}-c)`}>
        <path d="M0 0h240v74q-120 34-240 0Z" fill={kit.yoke} />
        <path d="M58 90h9v108h-9Zm115 0h9v108h-9Z" fill={kit.trim} />
        <path d="M8 80l32 26 5-6-33-27Zm224 0-32 26-5-6 33-27Z" fill={kit.body === kit.yoke ? kit.trim : kit.body} />
        <rect width="240" height="200" fill={`url(#${id}-g)`} />
      </g>
      <path d="M78 20q42 30 84 0" fill="none" stroke={kit.body === "#f7f7f4" ? kit.trim : kit.body} strokeWidth="7" strokeLinecap="round" />
      <path d={shirt} fill="none" stroke="#0009" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="150" cy="112" r="15" fill="#fff" />
      <image href="/images/crest.png" x="138" y="100" width="24" height="24" />
      <text x="120" y="176" textAnchor="middle" fill={kit.number} style={{ font: "800 46px var(--f-d)" }}>{number}</text>
    </svg>
  );
}

export function KitCards() {
  const { t } = useLang();
  return (
    <div className="kits">
      {KITS.map((k, i) => (
        <div className="card kit" key={k.name}>
          <KitSvg kit={k} label={t(k.name)} number={["10", "7", "1"][i]} />
          <h3>{t(k.name)}</h3>
          <div className="swatches" aria-hidden="true">
            {[...new Set([k.body, k.yoke, k.shorts])].map((c) => <i key={c} style={{ background: c }} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

export function CallToAction() {
  const { t } = useLang();
  return (
    <div className="cta">
      <div className="wrap">
        <div>
          <h2>{t("ctaTitle")}</h2>
          <p>{t("ctaText")}</p>
        </div>
        <Link className="btn dark" href="/join">{t("btnRegister")}</Link>
      </div>
    </div>
  );
}
