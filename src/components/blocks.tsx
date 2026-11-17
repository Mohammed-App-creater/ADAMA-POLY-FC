"use client";
// Content blocks reused on more than one page.
import { useRef, type PointerEvent } from "react";
import Link from "next/link";
import { KITS, PROGRAMS, type KitDesign } from "@/lib/data";
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

const shirtPath = (neck: number) =>
  `M80 18 42 32Q30 37 24 50L6 84l34 22 18-18v112q62 8 124 0V88l18 18 34-22-18-34q-6-13-18-18l-38-14Q120 ${neck} 80 18Z`;
const BODY = "M58 98h124v102q-62 8-124 0Z";
const SHORTS = "M58 202h124l14 88h-68l-8-40-8 40H44Z";
const SOCKS = "M68 302h32l-5 76q-1 10-11 10t-11-10Zm72 0h32l-5 76q-1 10-11 10t-11-10Z";
// Left sleeve: cuff band plus the brush strokes running up from it. Mirrored for the right.
const SLEEVE = "M6 84 40 106 44.3 99.3 43.6 98.9 52.4 73.9 38.9 95.8 43.4 79.8 34.1 92.7 48.9 55.2 29.3 89.6 36.5 68.3 24.6 86.5 37.7 52.6 19.8 83.5 25.1 65.7 15.1 80.4 25.6 51.8 10.3 77.3Z";
const SHORTS_TRIM = "M50 252q16 12 12 38H44Z";

/**
 * One layer of the kit. `front` and `back` are the printed faces; `edge` is a plain
 * silhouette stacked between them to give the kit thickness when it turns.
 */
export function KitSvg({ kit, side, number = "9" }: { kit: KitDesign; side: "front" | "back" | "edge"; number?: string }) {
  const id = `${kit.name}-${side}`;
  const shirt = shirtPath(side === "front" ? 46 : 28);
  if (side === "edge") {
    return (
      <svg viewBox="0 0 240 400" className="e" aria-hidden="true">
        <path d={SOCKS} fill={kit.socks} />
        <path d={SHORTS} fill={kit.shorts} />
        <path d={shirt} fill={kit.yoke} />
        <path d={BODY} fill={kit.body} />
      </svg>
    );
  }
  const mirror = "matrix(-1 0 0 1 240 0)";
  return (
    <svg viewBox="0 0 240 400" className={side === "front" ? "f" : "b"} aria-hidden="true">
      <defs>
        <clipPath id={`${id}-c`}><path d={shirt} /></clipPath>
        <pattern id={`${id}-p`} width="26" height="30" patternUnits="userSpaceOnUse" patternTransform="rotate(28)">
          <path d="M6 2v13M19 17v13" stroke={kit.print} strokeWidth="3.5" strokeLinecap="round" />
        </pattern>
        <linearGradient id={`${id}-g`} x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity=".34" /><stop offset=".24" stopColor="#fff" stopOpacity=".12" />
          <stop offset=".5" stopColor="#fff" stopOpacity="0" /><stop offset=".8" stopColor="#000" stopOpacity=".08" />
          <stop offset="1" stopColor="#000" stopOpacity=".36" />
        </linearGradient>
      </defs>
      {/* socks */}
      <path d={SOCKS} fill={kit.socks} stroke="#0008" />
      <path d="M68 302h32l-.8 12H68.8Zm72 0h32l-.8 12h-30.4Z" fill="#fff" opacity=".1" />
      {/* shorts */}
      <path d={SHORTS} fill={kit.shorts} stroke="#0008" strokeLinejoin="round" />
      <path d={SHORTS_TRIM} fill={kit.shortsTrim} /><path d={SHORTS_TRIM} fill={kit.shortsTrim} transform={mirror} />
      <path d="M58 202h124l2 12H56Z" fill="#000" opacity=".2" />
      {side === "front" && (
        <>
          <text x="158" y="262" textAnchor="middle" fill={kit.text} style={{ font: "800 24px var(--f-d)" }}>{number}</text>
          <circle cx="84" cy="270" r="8" fill="#fff" />
          <image href="/images/crest.png" x="77.5" y="263.5" width="13" height="13" />
        </>
      )}
      <path d={SHORTS} fill={`url(#${id}-g)`} />
      {/* shirt */}
      <g clipPath={`url(#${id}-c)`}>
        <path d={shirt} fill={kit.yoke} />
        <path d={BODY} fill={kit.body} /><path d={BODY} fill={`url(#${id}-p)`} />
        <path d={SLEEVE} fill={kit.trim} /><path d={SLEEVE} fill={kit.trim} transform={mirror} />
        <path d="M58 90v110M182 90v110" stroke="#000" strokeOpacity=".16" strokeWidth="2" />
        {side === "front" ? (
          <>
            <circle cx="152" cy="72" r="13" fill="#fff" />
            <image href="/images/crest.png" x="141" y="61" width="22" height="22" />
          </>
        ) : (
          <>
            <text x="120" y="62" textAnchor="middle" fill={kit.text} style={{ font: "800 14px var(--f-d)" }}>COLLEGE ADAMA</text>
            <text x="120" y="76" textAnchor="middle" fill={kit.text} style={{ font: "700 11.5px var(--f-d)" }}>FOOTBALL ACADEMY</text>
            <text x="120" y="184" textAnchor="middle" fill={kit.number} style={{ font: "800 88px var(--f-d)" }}>{number}</text>
          </>
        )}
        <rect width="240" height="210" fill={`url(#${id}-g)`} />
      </g>
      <path d={`M80 18Q120 ${side === "front" ? 46 : 28} 160 18`} fill="none" stroke={kit.trim} strokeWidth="7" strokeLinecap="round" />
      <path d={shirt} fill="none" stroke="#0009" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

const EDGES = [-6, -4.5, -3, -1.5, 0, 1.5, 3, 4.5, 6];

/** The kit as a turning 3D object: spins slowly on its own, drag sideways to turn it by hand. */
export function Kit3D({ kit, label, number }: { kit: KitDesign; label: string; number?: string }) {
  const turn = useRef<HTMLDivElement>(null);
  const drag = useRef({ on: false, x: 0, angle: 0 });
  const stop = (e: PointerEvent<HTMLDivElement>) => { drag.current.on = false; delete e.currentTarget.dataset.drag; };
  return (
    <div
      className="kit3d" role="img" aria-label={label}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        drag.current.on = true; drag.current.x = e.clientX;
        e.currentTarget.dataset.drag = "";
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d.on || !turn.current) return;
        d.angle += (e.clientX - d.x) * 0.9; d.x = e.clientX;
        turn.current.style.transform = `rotateY(${d.angle}deg)`;
      }}
      onPointerUp={stop} onPointerCancel={stop}
    >
      <div className="spin">
        <div className="turn" ref={turn}>
          {EDGES.map((z) => <div key={z} style={{ transform: `translateZ(${z}px)` }}><KitSvg kit={kit} side="edge" /></div>)}
          <div className="face front"><KitSvg kit={kit} side="front" number={number} /></div>
          <div className="face back"><KitSvg kit={kit} side="back" number={number} /></div>
        </div>
      </div>
    </div>
  );
}

export function KitCards() {
  const { t } = useLang();
  return (
    <div className="kits">
      {KITS.map((k, i) => (
        <div className="card kit" key={k.name}>
          <Kit3D kit={k} label={t(k.name)} number={["9", "7", "10"][i]} />
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
