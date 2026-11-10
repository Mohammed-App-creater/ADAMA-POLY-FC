"use client";
// Shared client-side pieces: language context, API helpers, small UI parts.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { GROUPS, baseSquad, type SquadPlayer } from "@/lib/data";
import { translate, isKey, type Key, type Lang } from "@/lib/i18n";

/* ---------- language ---------- */
const LangCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: Key) => string }>({
  lang: "en", setLang: () => {}, t: (k) => translate("en", k),
});
export function LangProvider({ initial, children }: { initial: Lang; children: ReactNode }) {
  const [lang, set] = useState<Lang>(initial);
  const setLang = useCallback((l: Lang) => {
    set(l);
    document.cookie = `lang=${l}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = l;
  }, []);
  const value = useMemo(() => ({ lang, setLang, t: (k: Key) => translate(lang, k) }), [lang, setLang]);
  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>;
}
export const useLang = () => useContext(LangCtx);
/** Staff roles are stored either as a translation key (r_head) or as free text. */
export const roleLabel = (t: (k: Key) => string, role: string) => (isKey(role) ? t(role) : role);

/* ---------- API ---------- */
export async function api<T = unknown>(method: string, url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Request failed");
  return json as T;
}

export function useCollection<T>(name: string) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    try {
      const res = await fetch(`/api/${name}`, { cache: "no-store" });
      if (res.ok) setRows(await res.json());
    } catch {
      /* keep what we have */
    } finally {
      setLoading(false);
    }
  }, [name]);
  useEffect(() => { reload(); }, [reload]);
  return { rows, loading, reload };
}

/* ---------- shared records ---------- */
export type Player = { id: string; name: string; group: string; age?: number; studentId?: string; parent?: string; phone?: string; status?: string; createdAt?: number };
export type Payment = { id: string; playerId: string; playerName: string; group: string; receipt: string; status: string; createdAt: number };
export type Added = { id: string; name: string; group: string; pos: SquadPlayer["pos"]; jersey?: string };
export type Jersey = { id: string; number: string };
export type Fixture = { id: string; group: string; opponent: string; date: string; time: string; venue: string; side: string; competition: string; scoreUs: string; scoreThem: string };
export type NewsItem = { id: string; title: string; date: string; body: string };
export type Message = { id: string; name: string; phone: string; email: string; message: string; createdAt: number };

/** Sample squads + players staff added, with staff-assigned jersey numbers applied. */
export function useSquads() {
  const added = useCollection<Added>("squadPlayers");
  const jerseys = useCollection<Jersey>("jerseys");
  const squads = useMemo(() => {
    const num = new Map(jerseys.rows.map((j) => [j.id, j.number]));
    const all: SquadPlayer[] = [
      ...GROUPS.flatMap(baseSquad),
      ...added.rows.map((a) => ({ id: `add-${a.id}`, name: a.name, group: a.group, pos: a.pos, number: a.jersey || "", added: true })),
    ];
    return all.map((p) => ({ ...p, number: num.get(p.id) || p.number }));
  }, [added.rows, jerseys.rows]);
  return { squads, reload: () => { added.reload(); jerseys.reload(); } };
}

/** Everyone a payment can be made for: squad players plus registered players. */
export function useRoster() {
  const { squads } = useSquads();
  const players = useCollection<Player>("players");
  const roster = useMemo(
    () => [...squads.map(({ id, name, group }) => ({ id, name, group })), ...players.rows.map(({ id, name, group }) => ({ id, name, group }))],
    [squads, players.rows],
  );
  return roster;
}

/* ---------- UI ---------- */
export function PageHeader({ title, lead }: { title: string; lead?: string }) {
  return (
    <header className="pagehead">
      <div className="wrap">
        <h1>{title}</h1>
        {lead && <p>{lead}</p>}
      </div>
    </header>
  );
}

export function Notice({ state }: { state: { ok: boolean; text: string } | null }) {
  if (!state) return null;
  return <div className={`msg ${state.ok ? "ok" : "err"}`} role="status">{state.text}</div>;
}

export function StatusBadge({ status }: { status: string }) {
  const { t } = useLang();
  const s = ["pending", "verified", "rejected"].includes(status) ? (status as "pending") : "pending";
  return <span className={`badge b-${s}`}>{t(s)}</span>;
}

export function Lightbox({ src, onClose }: { src: string | null; onClose: () => void }) {
  useEffect(() => {
    if (!src) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [src, onClose]);
  if (!src) return null;
  return (
    <div className="modal" role="dialog" aria-modal="true" onClick={onClose}>
      <button className="btn sm" type="button" aria-label="Close" autoFocus>✕</button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" onClick={(e) => e.stopPropagation()} />
    </div>
  );
}

export const fmtDate = (iso: string, lang: Lang) => {
  const d = new Date(iso + "T00:00:00");
  if (isNaN(+d)) return iso;
  return d.toLocaleDateString(lang === "en" ? "en-GB" : lang, { day: "numeric", month: "short", year: "numeric" });
};

/** Shrink a photo in the browser to a JPEG data URL before upload. */
export function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const s = Math.min(1, 1100 / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * s);
        c.height = Math.round(img.height * s);
        c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL("image/jpeg", 0.72));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
