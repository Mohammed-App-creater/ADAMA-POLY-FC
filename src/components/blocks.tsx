"use client";
// Content blocks reused on more than one page.
import Link from "next/link";
import { PROGRAMS } from "@/lib/data";
import { fmtDate, useCollection, useLang, type Fixture, type NewsItem, type Story, type TrainingTime } from "./client";

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

/** Cards for players who went on to bigger things (newest first). */
export function StoryCards({ rows, limit }: { rows: Story[]; limit?: number }) {
  const list = [...rows].sort((a, b) => (b.year || "").localeCompare(a.year || "")).slice(0, limit);
  return (
    <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))" }}>
      {list.map((s) => (
        <article className="card person story" key={s.id}>
          <div className="photo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {s.photo ? <img src={s.photo} alt={s.name} loading="lazy" /> : <span aria-hidden="true">{s.name.charAt(0)}</span>}
            {s.year && <em>{s.year}</em>}
          </div>
          <div className="body">
            <h3>{s.name}</h3>
            <div className="tagline">{s.achievement}</div>
            {s.story && <p>{s.story}</p>}
          </div>
        </article>
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

/** The maker's picture of the players' kit, front and back. */
export function KitImage() {
  const { t } = useLang();
  return (
    <figure className="kit-photo">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/kit.jpg" alt={t("kitTitle")} width={1067} height={1247} loading="lazy" />
    </figure>
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
