"use client";
// Admin panel: sidebar layout with an overview and one section per kind of record.
// Every list can be added to, edited and deleted from here.
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import {
  Lightbox, StatusBadge, api, compressImage, fmtDate, roleLabel, useCollection, useLang, useSettings,
  type Added, type Fixture, type GalleryPhoto, type Message, type NewsItem, type Payment, type Player, type Story, type TrainingTime,
} from "@/components/client";
import { ALL_GROUPS, GROUPS, ROLE_KEYS, type StaffMember } from "@/lib/data";
import { isKey, type Key } from "@/lib/i18n";

type Data = Record<string, unknown>;
type Field = { name: string; label: string; type?: string; options?: (string | [string, string])[]; required?: boolean; wide?: boolean };

/* ---------- field lists (shared by the add and edit forms) ---------- */
const PHOTO: Field = { name: "photo", label: "Photo", type: "photo" };
const PLAYER: Field[] = [
  PHOTO,
  { name: "name", label: "Player name", required: true },
  { name: "age", label: "Age", type: "number", required: true },
  { name: "group", label: "Age group", options: [...ALL_GROUPS] },
  { name: "studentId", label: "Student ID", required: true },
  { name: "parent", label: "Parent name", required: true },
  { name: "phone", label: "Phone", type: "tel", required: true },
  { name: "status", label: "Status", options: ["Pending", "Active", "Inactive"] },
];
const SQUAD: Field[] = [
  PHOTO,
  { name: "name", label: "Name", required: true },
  { name: "group", label: "Age group", options: [...GROUPS] },
  { name: "pos", label: "Position", options: [["GK", "Goalkeeper"], ["DEF", "Defender"], ["MID", "Midfielder"], ["FWD", "Forward"]] },
  { name: "jersey", label: "Jersey number", type: "number" },
  { name: "starter", label: "Role in the team", options: [["no", "Substitute"], ["yes", "Starter"]] },
  { name: "foot", label: "Preferred foot", options: [["", "Not set"], ["R", "Right"], ["L", "Left"]] },
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
const TRAINING: Field[] = [
  { name: "group", label: "Age group", options: [...GROUPS] },
  { name: "days", label: "Days (for example: Mon, Wed, Fri)", required: true },
  { name: "time", label: "Time (for example: 4:30 – 6:00 PM)", required: true },
];
const STORY: Field[] = [
  PHOTO,
  { name: "name", label: "Player name", required: true },
  { name: "year", label: "Year (for example: 2026)", type: "number" },
  { name: "achievement", label: "Where they are now (for example: Signed for Adama City FC)", required: true, wide: true },
  { name: "story", label: "Their story (optional)", type: "textarea", wide: true },
];
const GALLERY_FIELDS: Field[] = [
  { name: "photo", label: "Photo", type: "photo" },
  { name: "caption", label: "Caption (optional)", wide: true },
];
const MAX_BATCH = 30; // photos per upload
const SETTINGS: Field[] = [
  { name: "phone", label: "Phone", type: "tel" },
  { name: "email", label: "Email", type: "email" },
  { name: "address", label: "Address", wide: true },
  { name: "bankAccount", label: "Bank account for fees (shown on the Pay page)", wide: true },
];
const ROLES: Key[] = [...ROLE_KEYS, "r_second", "r_coach"];

/* ---------- small building blocks ---------- */
/** Photo chooser: shows the current photo and lets staff replace or remove it. */
function PhotoInput({ label, current, onChange }: { label: string; current: string; onChange: (v: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function pick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Please choose an image file.");
    setBusy(true);
    setError("");
    try {
      onChange(await compressImage(file));
    } catch {
      setError("Could not read that image.");
    }
    setBusy(false);
  }
  return (
    <div className="photo-input">
      <span className="avatar lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {current ? <img src={current} alt="" /> : <span aria-hidden="true">?</span>}
      </span>
      <div>
        <span className="photo-label">{label}</span>
        <div className="btn-row">
          <label className="btn sm plain">
            {busy ? "Loading…" : current ? "Change photo" : "Upload photo"}
            <input type="file" accept="image/*" hidden onChange={pick} disabled={busy} />
          </label>
          {current && <button className="btn sm plain" type="button" onClick={() => onChange("")}>Remove</button>}
        </div>
        {error && <div className="msg err" role="alert">{error}</div>}
      </div>
    </div>
  );
}

function RecordForm({ fields, initial, button, onSubmit, onCancel }: {
  fields: Field[]; initial?: Data; button: string; onSubmit: (d: Data) => Promise<void>; onCancel?: () => void;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  // Photo fields live in state (not the form) so only changed photos are sent.
  const [photos, setPhotos] = useState<Record<string, string>>({});
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    setError("");
    try {
      await onSubmit({ ...Object.fromEntries(new FormData(form)), ...photos });
      if (!initial) { form.reset(); setPhotos({}); }
    } catch (x) {
      setError((x as Error).message);
    }
    setBusy(false);
  }
  const val = (f: Field) => (initial?.[f.name] ?? "") as string;
  return (
    <form onSubmit={submit}>
      <div className="row">
        {fields.map((f) => f.type === "photo" ? (
          <div key={f.name} style={{ gridColumn: "1 / -1" }}>
            <PhotoInput label={f.label} current={photos[f.name] ?? val(f)} onChange={(v) => setPhotos((p) => ({ ...p, [f.name]: v }))} />
          </div>
        ) : (
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

/** Choose several photos at once, check them, then upload them one after another. */
function BatchUpload({ coach, onUploaded, onDone }: { coach: string; onUploaded: () => void; onDone: (count: number) => void }) {
  const [items, setItems] = useState<{ key: number; src: string }[]>([]);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  async function pick(e: ChangeEvent<HTMLInputElement>) {
    const chosen = [...(e.target.files ?? [])];
    e.target.value = "";
    const room = MAX_BATCH - items.length;
    setError(chosen.length > room ? `Only ${MAX_BATCH} photos can be uploaded at a time. The rest were left out.` : "");
    let skipped = 0;
    let n = 0;
    for (const file of chosen.slice(0, room)) {
      setBusy(`Preparing photo ${++n} of ${Math.min(chosen.length, room)}…`);
      try {
        if (!file.type.startsWith("image/")) throw new Error();
        const src = await compressImage(file);
        setItems((p) => [...p, { key: Date.now() + Math.random(), src }]);
      } catch {
        skipped++;
      }
    }
    if (skipped) setError(`${skipped} file${skipped > 1 ? "s were" : " was"} skipped because it could not be read as an image.`);
    setBusy("");
  }

  async function upload() {
    setError("");
    const todo = [...items];
    let done = 0;
    for (const it of todo) {
      setBusy(`Uploading ${done + 1} of ${todo.length}…`);
      try {
        await api("POST", "/api/gallery", { caption, coach, photo: it.src });
        done++;
        setItems((p) => p.filter((x) => x.key !== it.key));
      } catch (x) {
        setError(`${done} of ${todo.length} uploaded, then it stopped: ${(x as Error).message}. The photos still shown were not uploaded.`);
        break;
      }
    }
    setBusy("");
    if (done) onUploaded();
    if (done === todo.length) onDone(done);
  }

  return (
    <div className="batch">
      <label className="btn plain">
        {items.length ? "+ Choose more photos" : "Choose photos"}
        <input type="file" accept="image/*" multiple hidden onChange={pick} disabled={!!busy} />
      </label>
      <p className="muted">You can pick many photos at once.</p>
      {items.length > 0 && (
        <>
          <div className="batch-grid">
            {items.map((it) => (
              <figure key={it.key}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.src} alt="" />
                <button type="button" aria-label="Remove this photo" disabled={!!busy} onClick={() => setItems((p) => p.filter((x) => x.key !== it.key))}>✕</button>
              </figure>
            ))}
          </div>
          <label>
            Caption for these photos (optional)
            <input value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={160} />
          </label>
        </>
      )}
      {busy && <div className="msg ok" role="status">{busy}</div>}
      {error && <div className="msg err" role="alert">{error}</div>}
      <div className="btn-row">
        <button className="btn" type="button" disabled={!items.length || !!busy} onClick={upload}>
          {items.length ? `Upload ${items.length} photo${items.length > 1 ? "s" : ""}` : "Upload"}
        </button>
        <button className="btn ghost" type="button" disabled={!!busy} onClick={() => onDone(0)}>Close</button>
      </div>
    </div>
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

/** Small round photo (or initial) for list rows; click to enlarge. */
function Avatar({ src, name, onOpen }: { src?: string; name: string; onOpen: (s: string) => void }) {
  return src ? (
    <button className="avatar" type="button" aria-label={`View photo of ${name}`} onClick={() => onOpen(src)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" />
    </button>
  ) : <span className="avatar" aria-hidden="true">{name.charAt(0)}</span>;
}

function Panel({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="panel">
      <div className="panel-head"><h2>{title}</h2>{action}</div>
      {children}
    </div>
  );
}

const SECTIONS = ["Overview", "Payments", "Players", "Squads", "Coaches", "Training", "Fixtures", "News", "Success", "Gallery", "Messages", "Settings"] as const;
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
  const [sGroup, setSGroup] = useState("U10");
  // Multi-photo sheet: coach is "" for the training gallery, or a coach id.
  const [batch, setBatch] = useState<{ title: string; coach: string } | null>(null);

  const players = useCollection<Player>("players");
  const payments = useCollection<Payment>("payments");
  const staff = useCollection<StaffMember & { id: string }>("staff");
  const squad = useCollection<Added>("squadPlayers");
  const training = useCollection<TrainingTime>("schedule");
  const gallery = useCollection<GalleryPhoto>("gallery");
  const stories = useCollection<Story>("stories");
  const { settings, reload: reloadSettings } = useSettings();
  const fixtures = useCollection<Fixture>("fixtures");
  const news = useCollection<NewsItem>("news");
  const messages = useCollection<Message>("messages");

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
  /** Open the add/edit sheet for a collection. `defaults` pre-fills a new row. */
  const openForm = (
    title: string, col: string, fields: Field[], reload: () => void, row?: Data & { id: string },
    prepare: (d: Data) => Data = (d) => d, defaults?: Data, method?: "POST",
  ) =>
    setForm({
      title, fields, initial: row ?? defaults,
      save: async (d) => {
        const create = !row || method === "POST";
        await api(create ? "POST" : "PATCH", create ? `/api/${col}` : `/api/${col}/${row.id}`, prepare(d));
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

  const squads = squad.rows;
  const trainingPhotos = gallery.rows.filter((g) => !g.coach);
  const batchPhotos = batch?.coach ? gallery.rows.filter((g) => g.coach === batch.coach) : [];
  const shownSquad = squads.filter((p) => p.group === sGroup).sort((a, b) => (Number(a.jersey) || 999) - (Number(b.jersey) || 999));
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
    PHOTO,
    { name: "name", label: "Name", required: true },
    { name: "roleKey", label: "Role", options: [...ROLES.map((k) => [k, t(k)] as [string, string]), ["", "Other (type below)"]] },
    { name: "roleText", label: "Other role title" },
    { name: "phone", label: "Phone", type: "tel" },
    { name: "jersey", label: "Jersey number", type: "number" },
  ];
  const staffOut = (d: Data) => ({ name: d.name, phone: d.phone, jersey: d.jersey, photo: d.photo, role: String(d.roleText || "").trim() || d.roleKey });
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
          <span>COLLEGE ADAMA<small>Football Academy · Admin</small></span>
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
                <thead><tr><th /><th>Name</th><th>Age</th><th>Group</th><th>Student ID</th><th>Parent</th><th>Phone</th><th>Status</th><th /></tr></thead>
                <tbody>
                  {shownPlayers.map((p) => (
                    <tr key={p.id}>
                      <td><Avatar src={p.photo} name={p.name} onOpen={setPhoto} /></td>
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
                  {!shownPlayers.length && <tr><td colSpan={9}>No players found.</td></tr>}
                </tbody>
              </table>
            </div>
          </Panel>
        )}

        {section === "Squads" && (
          <Panel title="Squad players" action={<button className="btn sm" type="button" onClick={() => openForm("Add squad player", "squadPlayers", SQUAD, squad.reload, undefined, undefined, { group: sGroup })}>+ Add player</button>}>
            <div className="tabs" role="tablist" style={{ margin: "0 0 14px" }}>
              {GROUPS.map((g) => (
                <button key={g} className="tab" role="tab" type="button" aria-selected={sGroup === g} onClick={() => setSGroup(g)}>
                  {g} ({squads.filter((p) => p.group === g).length})
                </button>
              ))}
            </div>
            <p className="muted">These players appear on the Squads page. The site starts with sample names: edit or delete them and add your real players.</p>
            {shownSquad.length ? shownSquad.map((p) => (
              <div className="rowcard" key={p.id}>
                <Avatar src={p.photo} name={p.name} onOpen={setPhoto} />
                <span className="jn">{p.jersey || "–"}</span>
                <div className="grow"><b>{p.name}</b><div className="muted">{p.group} · {p.pos}{p.starter === "yes" ? " · Starter" : ""}</div></div>
                <button className="btn sm plain" type="button" onClick={() => openForm("Edit squad player", "squadPlayers", SQUAD, squad.reload, p)}>Edit</button>
                <button className="btn sm badb" type="button" onClick={() => remove("squadPlayers", p.id, squad.reload, "squad player")}>Delete</button>
              </div>
            )) : <p className="empty">No players in this squad yet.</p>}
          </Panel>
        )}

        {section === "Coaches" && (
          <Panel title="Coaches and staff" action={<button className="btn sm" type="button" onClick={() => openForm("Add coach", "staff", staffFields, staff.reload, undefined, staffOut)}>+ Add coach</button>}>
            <p className="muted">Everyone listed here appears on the Coaches page.</p>
            {staff.rows.length ? staff.rows.map((s) => (
              <div className="rowcard" key={s.id}>
                <Avatar src={s.photo} name={s.name} onOpen={setPhoto} />
                <div className="grow"><b>{s.name}</b><div className="muted">{roleLabel(t, s.role)}{s.jersey ? ` · #${s.jersey}` : ""}{s.phone ? ` · ${s.phone}` : ""}</div></div>
                <button className="btn sm plain" type="button" onClick={() => setBatch({ title: `Photos of ${s.name}`, coach: s.id })}>Photos ({gallery.rows.filter((g) => g.coach === s.id).length})</button>
                <button className="btn sm plain" type="button" onClick={() => openForm("Edit coach", "staff", staffFields, staff.reload, staffIn(s), staffOut)}>Edit</button>
                <button className="btn sm badb" type="button" onClick={() => remove("staff", s.id, () => { staff.reload(); gallery.reload(); }, "coach")}>Delete</button>
              </div>
            )) : <p className="empty">No coaches yet.</p>}
          </Panel>
        )}

        {section === "Training" && (
          <Panel title="Weekly training times" action={<button className="btn sm" type="button" onClick={() => openForm("Set training time", "schedule", TRAINING, training.reload, undefined, (d) => ({ ...d, id: d.group }))}>+ Set training time</button>}>
            <p className="muted">One row per age group, shown on the Schedule and Programs pages. Setting a time for a group that already has one replaces it.</p>
            {training.rows.length ? training.rows.map((s) => (
              <div className="rowcard" key={s.id}>
                <span className="jn">{s.group.replace("U", "")}</span>
                <div className="grow"><b>{s.group}</b><div className="muted">{s.days} · {s.time}</div></div>
                <button className="btn sm plain" type="button" onClick={() => openForm(`Edit ${s.group} training time`, "schedule", TRAINING.slice(1), training.reload, s)}>Edit</button>
                <button className="btn sm badb" type="button" onClick={() => remove("schedule", s.id, training.reload, "training time")}>Delete</button>
              </div>
            )) : <p className="empty">No training times yet.</p>}
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

        {section === "Success" && (
          <Panel title="Success stories" action={<button className="btn sm" type="button" onClick={() => openForm("Add success story", "stories", STORY, stories.reload)}>+ Add player</button>}>
            <p className="muted">Players from the academy who reached a club, a national team or another big step. They appear on the Success stories page, and the newest three on the home page.</p>
            {stories.rows.length ? [...stories.rows].sort((a, b) => (b.year || "").localeCompare(a.year || "")).map((s) => (
              <div className="rowcard" key={s.id}>
                <Avatar src={s.photo} name={s.name} onOpen={setPhoto} />
                <div className="grow"><b>{s.name}</b><div className="muted">{[s.year, s.achievement].filter(Boolean).join(" · ")}</div></div>
                <button className="btn sm plain" type="button" onClick={() => openForm("Edit success story", "stories", STORY, stories.reload, s)}>Edit</button>
                <button className="btn sm badb" type="button" onClick={() => remove("stories", s.id, stories.reload, "success story")}>Delete</button>
              </div>
            )) : <p className="empty">No success stories yet.</p>}
          </Panel>
        )}

        {section === "Gallery" && (
          <Panel title="Gallery photos" action={<button className="btn sm" type="button" onClick={() => setBatch({ title: "Add gallery photos", coach: "" })}>+ Add photos</button>}>
            <p className="muted">Photos for the public Gallery page. Each coach's own photos are added from the Coaches section.</p>
            {trainingPhotos.length ? (
              <div className="gal-admin">
                {trainingPhotos.map((g) => (
                  <figure key={g.id}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={g.photo} alt={g.caption} loading="lazy" onClick={() => setPhoto(g.photo)} />
                    <figcaption>{g.caption || <span className="muted">No caption</span>}</figcaption>
                    <div className="btn-row">
                      <button className="btn sm plain" type="button" onClick={() => openForm("Edit photo", "gallery", GALLERY_FIELDS, gallery.reload, g)}>Edit</button>
                      <button className="btn sm badb" type="button" onClick={() => remove("gallery", g.id, gallery.reload, "photo")}>Delete</button>
                    </div>
                  </figure>
                ))}
              </div>
            ) : <p className="empty">No photos yet.</p>}
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

        {section === "Settings" && (
          <Panel title="Contact details" action={<button className="btn sm" type="button" onClick={() => openForm("Edit contact details", "settings", SETTINGS, reloadSettings, { id: "site", ...settings }, (d) => ({ ...d, id: "site" }), undefined, "POST")}>Edit</button>}>
            <p className="muted">Shown in the website footer, on the Contact page and on the Pay page.</p>
            <div className="rowcard"><div className="grow"><b>Phone</b><div className="muted">{settings.phone || "Not set"}</div></div></div>
            <div className="rowcard"><div className="grow"><b>Email</b><div className="muted">{settings.email || "Not set"}</div></div></div>
            <div className="rowcard"><div className="grow"><b>Address</b><div className="muted">{settings.address || "Not set"}</div></div></div>
            <div className="rowcard"><div className="grow"><b>Bank account for fees</b><div className="muted">{settings.bankAccount || "Not set"}</div></div></div>
          </Panel>
        )}
      </div>

      {form && (
        <Sheet title={form.title} onClose={() => setForm(null)}>
          <RecordForm fields={form.fields} initial={form.initial} button="Save" onSubmit={async (d) => { await form.save(d); }} onCancel={() => setForm(null)} />
        </Sheet>
      )}
      {batch && (
        <Sheet title={batch.title} onClose={() => setBatch(null)}>
          {batch.coach && (
            <>
              <p className="muted">These photos appear on this coach's card on the Coaches page. The main profile photo is set with Edit.</p>
              {batchPhotos.length > 0 && (
                <div className="batch-grid">
                  {batchPhotos.map((g) => (
                    <figure key={g.id}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={g.photo} alt={g.caption} onClick={() => setPhoto(g.photo)} />
                      <button type="button" aria-label="Delete this photo" onClick={() => remove("gallery", g.id, gallery.reload, "photo")}>✕</button>
                    </figure>
                  ))}
                </div>
              )}
            </>
          )}
          <BatchUpload
            coach={batch.coach}
            onUploaded={gallery.reload}
            onDone={(n) => {
              if (n) setToast({ ok: true, text: `${n} photo${n > 1 ? "s" : ""} uploaded` });
              if (!batch.coach || !n) setBatch(null);
            }}
          />
        </Sheet>
      )}
      {toast && <div className={`toast ${toast.ok ? "ok" : "err"}`} role="status">{toast.text}</div>}
      <Lightbox src={photo} onClose={() => setPhoto(null)} />
    </div>
  );
}
