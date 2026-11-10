"use client";
// Admin panel: sidebar layout with an overview and one section per kind of record.
// Every list can be added to, edited and deleted from here.
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  Lightbox, StatusBadge, api, fmtDate, roleLabel, useCollection, useLang, useRoster, useSquads,
  type Added, type Fixture, type Message, type NewsItem, type Payment, type Player,
} from "@/components/client";
import { ALL_GROUPS, GROUPS, ROLE_KEYS, type StaffMember } from "@/lib/data";
import { isKey, type Key } from "@/lib/i18n";

type Data = Record<string, unknown>;
type Field = { name: string; label: string; type?: string; options?: (string | [string, string])[]; required?: boolean; wide?: boolean };

/* ---------- field lists (shared by the add and edit forms) ---------- */
const PLAYER: Field[] = [
  { name: "name", label: "Player name", required: true },
  { name: "age", label: "Age", type: "number", required: true },
  { name: "group", label: "Age group", options: [...ALL_GROUPS] },
  { name: "studentId", label: "Student ID", required: true },
  { name: "parent", label: "Parent name", required: true },
  { name: "phone", label: "Phone", type: "tel", required: true },
  { name: "status", label: "Status", options: ["Pending", "Active", "Inactive"] },
];
const SQUAD: Field[] = [
  { name: "name", label: "Name", required: true },
  { name: "group", label: "Age group", options: [...GROUPS] },
  { name: "pos", label: "Position", options: [["GK", "Goalkeeper"], ["DEF", "Defender"], ["MID", "Midfielder"], ["FWD", "Forward"]] },
  { name: "jersey", label: "Jersey number", type: "number" },
];
const FIXTURE: Field[] = [
  { name: "group", label: "Our team", options: [...ALL_GROUPS] },
  { name: "opponent", label: "Opponent", required: true },
  { name: "date", label: "Date", type: "date", required: true },
  { name: "time", label: "Kick-off", type: "time" },
  { name: "venue", label: "Venue" },
  { name: "side", label: "Home or away", options: [["home", "Home"], ["away", "Away"]] },
  { name: "competition", label: "Competition" },
  { name: "scoreUs", label: "Our score (after the match)", type: "number" },
  { name: "scoreThem", label: "Their score (after the match)", type: "number" },
];
const NEWS: Field[] = [
  { name: "title", label: "Title", required: true },
  { name: "date", label: "Date", type: "date", required: true },
  { name: "body", label: "Text", type: "textarea", required: true, wide: true },
];
const ROLES: Key[] = [...ROLE_KEYS, "r_second", "r_coach"];

/* ---------- small building blocks ---------- */
function RecordForm({ fields, initial, button, onSubmit, onCancel }: {
  fields: Field[]; initial?: Data; button: string; onSubmit: (d: Data) => Promise<void>; onCancel?: () => void;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    setError("");
    try {
      await onSubmit(Object.fromEntries(new FormData(form)));
      if (!initial) form.reset();
    } catch (x) {
      setError((x as Error).message);
    }
    setBusy(false);
  }
  const val = (f: Field) => (initial?.[f.name] ?? "") as string;
  return (
    <form onSubmit={submit}>
      <div className="row">
        {fields.map((f) => (
          <div key={f.name} style={f.wide ? { gridColumn: "1 / -1" } : undefined}>
            <label>
              {f.label}
              {f.options ? (
                <select name={f.name} defaultValue={initial ? val(f) : undefined}>
                  {f.options.map((o) => (typeof o === "string" ? <option key={o}>{o}</option> : <option key={o[0]} value={o[0]}>{o[1]}</option>))}
                </select>
              ) : f.type === "textarea" ? (
                <textarea name={f.name} required={f.required} defaultValue={val(f)} />
              ) : (
                <input name={f.name} type={f.type ?? "text"} required={f.required} defaultValue={val(f)} />
              )}
            </label>
          </div>
        ))}
      </div>
      {error && <div className="msg err" role="alert">{error}</div>}
      <div className="btn-row">
        <button className="btn" type="submit" disabled={busy}>{busy ? "Saving…" : button}</button>
        {onCancel && <button className="btn ghost" type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet">
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}

function Panel({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="panel">
      <div className="panel-head"><h2>{title}</h2>{action}</div>
      {children}
    </div>
  );
}

const SECTIONS = ["Overview", "Payments", "Players", "Squads", "Coaches", "Fixtures", "News", "Messages"] as const;
type Section = (typeof SECTIONS)[number];

export default function Dashboard() {
  const { t, lang } = useLang();
  const router = useRouter();
  const [section, setSection] = useState<Section>("Overview");
  const [photo, setPhoto] = useState<string | null>(null);
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null);
  const [form, setForm] = useState<{ title: string; fields: Field[]; initial?: Data; save: (d: Data) => Promise<unknown> } | null>(null);
  const [q, setQ] = useState("");
  const [gf, setGf] = useState("");
  const [payFilter, setPayFilter] = useState("pending");
  const [jGroup, setJGroup] = useState("U10");

  const players = useCollection<Player>("players");
  const payments = useCollection<Payment>("payments");
  const staff = useCollection<StaffMember & { id: string }>("staff");
  const added = useCollection<Added>("squadPlayers");
  const fixtures = useCollection<Fixture>("fixtures");
  const news = useCollection<NewsItem>("news");
  const messages = useCollection<Message>("messages");
  const { squads, reload: reloadSquads } = useSquads();
  const roster = useRoster();

  // Remember the open section in the address bar so a refresh keeps it.
  useEffect(() => {
    const h = decodeURIComponent(window.location.hash.slice(1));
    if ((SECTIONS as readonly string[]).includes(h)) setSection(h as Section);
  }, []);
  const go = (s: Section) => { setSection(s); window.history.replaceState(null, "", `#${s}`); window.scrollTo(0, 0); };

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(id);
  }, [toast]);

  /** Run an API call, show the outcome, then reload the affected list. */
  const run = useCallback(async (fn: () => Promise<unknown>, reload: () => void, done = "Saved") => {
    try {
      await fn();
      setToast({ ok: true, text: done });
    } catch (x) {
      setToast({ ok: false, text: (x as Error).message });
    }
    reload();
  }, []);
  const remove = (col: string, id: string, reload: () => void, what: string) => {
    if (confirm(`Delete this ${what}? This cannot be undone.`)) run(() => api("DELETE", `/api/${col}/${id}`), reload, "Deleted");
  };
  /** Open the add/edit sheet for a collection. */
  const openForm = (title: string, col: string, fields: Field[], reload: () => void, row?: Data & { id: string }, prepare: (d: Data) => Data = (d) => d) =>
    setForm({
      title, fields, initial: row,
      save: async (d) => {
        await api(row ? "PATCH" : "POST", row ? `/api/${col}/${row.id}` : `/api/${col}`, prepare(d));
        setForm(null);
        setToast({ ok: true, text: "Saved" });
        reload();
      },
    });
  const logout = async () => {
    await api("DELETE", "/api/auth");
    router.replace("/");
    router.refresh();
  };

  const reloadSquad = () => { added.reload(); reloadSquads(); };
  const pending = payments.rows.filter((p) => p.status === "pending").sort((a, b) => a.createdAt - b.createdAt);
  const unread = messages.rows.filter((m) => m.read !== "yes");
  const recent = [...players.rows].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  const shownPlayers = recent.filter((p) => (!gf || p.group === gf) && (!q || `${p.name} ${p.phone} ${p.parent} ${p.studentId}`.toLowerCase().includes(q.toLowerCase())));
  const shownPay = payments.rows
    .filter((p) => (payFilter === "all" || p.status === payFilter) && (!q || p.playerName.toLowerCase().includes(q.toLowerCase())))
    .sort((a, b) => b.createdAt - a.createdAt);
  const count: Partial<Record<Section, number>> = { Payments: pending.length, Messages: unread.length };
  const byGroup = ALL_GROUPS.map((g) => ({ g, squad: squads.filter((p) => p.group === g).length, reg: players.rows.filter((p) => p.group === g).length }));
  const maxGroup = Math.max(1, ...byGroup.map((x) => x.squad + x.reg));

  // Coaches pick a standard role or type their own title.
  const staffFields: Field[] = [
    { name: "name", label: "Name", required: true },
    { name: "roleKey", label: "Role", options: [...ROLES.map((k) => [k, t(k)] as [string, string]), ["", "Other (type below)"]] },
    { name: "roleText", label: "Other role title" },
    { name: "phone", label: "Phone", type: "tel" },
    { name: "jersey", label: "Jersey number", type: "number" },
  ];
  const staffOut = (d: Data) => ({ name: d.name, phone: d.phone, jersey: d.jersey, role: String(d.roleText || "").trim() || d.roleKey });
  const staffIn = (s: StaffMember & { id: string }) => ({ ...s, roleKey: isKey(s.role) ? s.role : "", roleText: isKey(s.role) ? "" : s.role });

  const payRow = (p: Payment) => (
    <div className="rowcard" key={p.id}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={p.receipt} alt="Receipt" onClick={() => setPhoto(p.receipt)} />
      <div className="grow"><b>{p.playerName}</b><div className="muted">{p.group} · {new Date(p.createdAt).toLocaleString()}</div></div>
      <StatusBadge status={p.status} />
      {p.status !== "verified" && <button className="btn sm okb" type="button" onClick={() => run(() => api("PATCH", `/api/payments/${p.id}`, { status: "verified" }), payments.reload, "Approved")}>Approve</button>}
      {p.status !== "rejected" && <button className="btn sm badb" type="button" onClick={() => run(() => api("PATCH", `/api/payments/${p.id}`, { status: "rejected" }), payments.reload, "Rejected")}>Reject</button>}
      {p.status !== "pending" && <button className="btn sm plain" type="button" onClick={() => run(() => api("PATCH", `/api/payments/${p.id}`, { status: "pending" }), payments.reload, "Moved back to pending")}>Undo</button>}
      <button className="btn sm plain" type="button" onClick={() => remove("payments", p.id, payments.reload, "payment")}>Delete</button>
    </div>
  );

  return (
    <div className="admin">
      <aside className="side">
        <Link className="side-brand" href="/">
          <i><Image src="/images/crest.png" alt="" width={38} height={38} /></i>
          <span>ADAMA POLY FC<small>Admin</small></span>
        </Link>
        <nav aria-label="Admin sections">
          {SECTIONS.map((s) => (
            <button key={s} type="button" aria-current={section === s ? "page" : undefined} onClick={() => go(s)}>
              {s}{count[s] ? <em>{count[s]}</em> : null}
            </button>
          ))}
        </nav>
        <div className="side-foot">
          <Link href="/">← View website</Link>
          <button type="button" onClick={logout}>Sign out</button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-head">
          <h1>{section}</h1>
          <p>{new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
        </header>

        {section === "Overview" && (
          <>
            <div className="kpis">
              <button className="kpi" type="button" onClick={() => go("Payments")}><b>{pending.length}</b><span>Receipts to check</span></button>
              <button className="kpi" type="button" onClick={() => go("Players")}><b>{players.rows.length}</b><span>Registrations</span></button>
              <button className="kpi" type="button" onClick={() => go("Players")}><b>{players.rows.filter((p) => p.status === "Pending").length}</b><span>Awaiting a call</span></button>
              <button className="kpi" type="button" onClick={() => go("Squads")}><b>{squads.length}</b><span>Squad players</span></button>
              <button className="kpi" type="button" onClick={() => go("Payments")}><b>{payments.rows.filter((p) => p.status === "verified").length}</b><span>Verified payments</span></button>
              <button className="kpi" type="button" onClick={() => go("Messages")}><b>{unread.length}</b><span>Unread messages</span></button>
            </div>
            <div className="panels">
              <Panel title="Receipts to check" action={<button className="btn sm plain" type="button" onClick={() => go("Payments")}>All payments</button>}>
                {pending.length ? pending.slice(0, 4).map(payRow) : <p className="empty">Nothing waiting.</p>}
              </Panel>
              <Panel title="Players by age group">
                <div className="bars">
                  {byGroup.map((x) => (
                    <div key={x.g}>
                      <span>{x.g}</span>
                      <div className="bar-track">
                        <i style={{ width: `${(x.squad / maxGroup) * 100}%` }} />
                        <i className="b2" style={{ width: `${(x.reg / maxGroup) * 100}%` }} />
                      </div>
                      <b>{x.squad + x.reg}</b>
                    </div>
                  ))}
                </div>
                <p className="legend"><i /> Squad <i className="b2" /> New registrations</p>
              </Panel>
              <Panel title="Latest registrations" action={<button className="btn sm plain" type="button" onClick={() => go("Players")}>All players</button>}>
                {recent.length ? recent.slice(0, 5).map((p) => (
                  <div className="rowcard" key={p.id}>
                    <div className="grow"><b>{p.name}</b><div className="muted">{p.group} · age {p.age} · {p.parent} · {p.phone}</div></div>
                    <span className={`badge ${p.status === "Active" ? "b-verified" : p.status === "Inactive" ? "b-backup" : "b-pending"}`}>{p.status}</span>
                  </div>
                )) : <p className="empty">No registrations yet.</p>}
              </Panel>
              <Panel title="Unread messages" action={<button className="btn sm plain" type="button" onClick={() => go("Messages")}>All messages</button>}>
                {unread.length ? unread.slice(0, 4).map((m) => (
                  <div className="rowcard" key={m.id}>
                    <div className="grow"><b>{m.name}</b><div className="muted">{m.message.slice(0, 110)}{m.message.length > 110 ? "…" : ""}</div></div>
                  </div>
                )) : <p className="empty">No unread messages.</p>}
              </Panel>
            </div>
          </>
        )}

        {section === "Payments" && (
          <Panel title="Fee receipts">
            <div className="bar">
              <div className="tabs" role="tablist" style={{ margin: 0 }}>
                {["pending", "verified", "rejected", "all"].map((s) => (
                  <button key={s} className="tab" role="tab" type="button" aria-selected={payFilter === s} onClick={() => setPayFilter(s)}>
                    {s} ({s === "all" ? payments.rows.length : payments.rows.filter((p) => p.status === s).length})
                  </button>
                ))}
              </div>
              <input placeholder="Search player" aria-label="Search player" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            {shownPay.length ? shownPay.map(payRow) : <p className="empty">No receipts here.</p>}
          </Panel>
        )}

        {section === "Players" && (
          <Panel title="Registered players" action={
            <div className="btn-row">
              <a className="btn sm plain" href="/api/export/players">Export CSV</a>
              <button className="btn sm" type="button" onClick={() => openForm("Add player", "players", PLAYER, players.reload)}>+ Add player</button>
            </div>
          }>
            <div className="bar">
              <input placeholder="Search name, parent, phone or student ID" aria-label="Search players" value={q} onChange={(e) => setQ(e.target.value)} />
              <select aria-label="Filter by group" value={gf} onChange={(e) => setGf(e.target.value)}>
                <option value="">All groups</option>
                {ALL_GROUPS.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
            <p className="muted">{players.rows.length} registered{shownPlayers.length !== players.rows.length ? ` · ${shownPlayers.length} shown` : ""}</p>
            <div className="scroll">
              <table className="tbl">
                <thead><tr><th>Name</th><th>Age</th><th>Group</th><th>Student ID</th><th>Parent</th><th>Phone</th><th>Status</th><th /></tr></thead>
                <tbody>
                  {shownPlayers.map((p) => (
                    <tr key={p.id}>
                      <td>{p.name}</td><td>{p.age}</td><td>{p.group}</td><td>{p.studentId}</td><td>{p.parent}</td><td>{p.phone}</td>
                      <td>
                        <select aria-label={`Status of ${p.name}`} value={p.status} onChange={(e) => run(() => api("PATCH", `/api/players/${p.id}`, { status: e.target.value }), players.reload)}>
                          {["Pending", "Active", "Inactive"].map((s) => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td>
                        <div className="btn-row">
                          <button className="btn sm plain" type="button" onClick={() => openForm("Edit player", "players", PLAYER, players.reload, p)}>Edit</button>
                          <button className="btn sm badb" type="button" onClick={() => remove("players", p.id, players.reload, "player")}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!shownPlayers.length && <tr><td colSpan={8}>No players found.</td></tr>}
                </tbody>
              </table>
            </div>
          </Panel>
        )}

        {section === "Squads" && (
          <div className="panels">
            <Panel title="Players added to squads" action={<button className="btn sm" type="button" onClick={() => openForm("Add squad player", "squadPlayers", SQUAD, reloadSquad)}>+ Add player</button>}>
              <p className="muted">The 80 sample squad names come from the site's data file. Players you add here appear on the Squads page next to them.</p>
              {added.rows.length ? added.rows.map((s) => (
                <div className="rowcard" key={s.id}>
                  <span className="jn">{s.jersey || "–"}</span>
                  <div className="grow"><b>{s.name}</b><div className="muted">{s.group} · {s.pos}</div></div>
                  <button className="btn sm plain" type="button" onClick={() => openForm("Edit squad player", "squadPlayers", SQUAD, reloadSquad, s)}>Edit</button>
                  <button className="btn sm badb" type="button" onClick={() => remove("squadPlayers", s.id, reloadSquad, "squad player")}>Delete</button>
                </div>
              )) : <p className="empty">No added players yet.</p>}
            </Panel>
            <Panel title="Jersey numbers">
              <RecordForm
                key={jGroup}
                button="Save jersey"
                fields={[
                  { name: "player", label: "Player", options: roster.filter((p) => p.group === jGroup).map((p) => [p.id, p.name] as [string, string]) },
                  { name: "number", label: "Jersey number", type: "number", required: true },
                ]}
                onSubmit={async (d) => {
                  await api("POST", "/api/jerseys", { id: d.player, number: d.number });
                  setToast({ ok: true, text: "Jersey saved" });
                  reloadSquads();
                }}
              />
              <div className="tabs" role="tablist" style={{ margin: "18px 0 0" }}>
                {ALL_GROUPS.map((g) => <button key={g} className="tab" role="tab" type="button" aria-selected={jGroup === g} onClick={() => setJGroup(g)}>{g}</button>)}
              </div>
              <p className="muted" style={{ marginTop: 10 }}>Pick the age group first, then the player.</p>
            </Panel>
          </div>
        )}

        {section === "Coaches" && (
          <Panel title="Coaches and staff" action={<button className="btn sm" type="button" onClick={() => openForm("Add coach", "staff", staffFields, staff.reload, undefined, staffOut)}>+ Add coach</button>}>
            <p className="muted">The three built-in coaches are set in the site's data file. Coaches you add here appear on the Coaches page after them.</p>
            {staff.rows.length ? staff.rows.map((s) => (
              <div className="rowcard" key={s.id}>
                <div className="grow"><b>{s.name}</b><div className="muted">{roleLabel(t, s.role)}{s.jersey ? ` · #${s.jersey}` : ""}{s.phone ? ` · ${s.phone}` : ""}</div></div>
                <button className="btn sm plain" type="button" onClick={() => openForm("Edit coach", "staff", staffFields, staff.reload, staffIn(s), staffOut)}>Edit</button>
                <button className="btn sm badb" type="button" onClick={() => remove("staff", s.id, staff.reload, "coach")}>Delete</button>
              </div>
            )) : <p className="empty">No added coaches yet.</p>}
          </Panel>
        )}

        {section === "Fixtures" && (
          <Panel title="Matches" action={<button className="btn sm" type="button" onClick={() => openForm("Add match", "fixtures", FIXTURE, fixtures.reload)}>+ Add match</button>}>
            {fixtures.rows.length ? [...fixtures.rows].sort((a, b) => b.date.localeCompare(a.date)).map((f) => (
              <div className="rowcard" key={f.id}>
                <div className="grow"><b>{f.group} vs {f.opponent}</b><div className="muted">{[fmtDate(f.date, lang), f.time, f.venue, f.competition].filter(Boolean).join(" · ")}</div></div>
                {f.scoreUs !== "" && f.scoreThem !== "" ? <span className="badge b-new">{f.scoreUs} – {f.scoreThem}</span> : <span className="badge b-backup">No score yet</span>}
                <button className="btn sm plain" type="button" onClick={() => openForm("Edit match", "fixtures", FIXTURE, fixtures.reload, f)}>Edit / score</button>
                <button className="btn sm badb" type="button" onClick={() => remove("fixtures", f.id, fixtures.reload, "match")}>Delete</button>
              </div>
            )) : <p className="empty">No matches yet.</p>}
          </Panel>
        )}

        {section === "News" && (
          <Panel title="News posts" action={<button className="btn sm" type="button" onClick={() => openForm("New post", "news", NEWS, news.reload, undefined, (d) => d)}>+ New post</button>}>
            {news.rows.length ? [...news.rows].sort((a, b) => b.date.localeCompare(a.date)).map((n) => (
              <div className="rowcard" key={n.id}>
                <div className="grow"><b>{n.title}</b><div className="muted">{fmtDate(n.date, lang)} · {n.body.slice(0, 90)}{n.body.length > 90 ? "…" : ""}</div></div>
                <button className="btn sm plain" type="button" onClick={() => openForm("Edit post", "news", NEWS, news.reload, n)}>Edit</button>
                <button className="btn sm badb" type="button" onClick={() => remove("news", n.id, news.reload, "post")}>Delete</button>
              </div>
            )) : <p className="empty">No posts yet.</p>}
          </Panel>
        )}

        {section === "Messages" && (
          <Panel title="Messages from the contact page">
            {messages.rows.length ? [...messages.rows].sort((a, b) => b.createdAt - a.createdAt).map((m) => (
              <div className={`rowcard${m.read === "yes" ? " read" : ""}`} key={m.id}>
                <div className="grow">
                  <b>{m.name}</b> {m.read !== "yes" && <span className="badge b-pending">New</span>}
                  <div className="muted">{[m.phone, m.email, new Date(m.createdAt).toLocaleString()].filter(Boolean).join(" · ")}</div>
                  <p style={{ whiteSpace: "pre-line", margin: "8px 0 0" }}>{m.message}</p>
                </div>
                <button className="btn sm plain" type="button" onClick={() => run(() => api("PATCH", `/api/messages/${m.id}`, { read: m.read === "yes" ? "no" : "yes" }), messages.reload, "Updated")}>
                  {m.read === "yes" ? "Mark unread" : "Mark read"}
                </button>
                <button className="btn sm badb" type="button" onClick={() => remove("messages", m.id, messages.reload, "message")}>Delete</button>
              </div>
            )) : <p className="empty">No messages.</p>}
          </Panel>
        )}
      </div>

      {form && (
        <Sheet title={form.title} onClose={() => setForm(null)}>
          <RecordForm fields={form.fields} initial={form.initial} button="Save" onSubmit={async (d) => { await form.save(d); }} onCancel={() => setForm(null)} />
        </Sheet>
      )}
      {toast && <div className={`toast ${toast.ok ? "ok" : "err"}`} role="status">{toast.text}</div>}
      <Lightbox src={photo} onClose={() => setPhoto(null)} />
    </div>
  );
}
