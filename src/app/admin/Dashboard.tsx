"use client";
// Staff dashboard: verify receipts and manage players, squads, coaches, fixtures, news and messages.
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  Lightbox, Notice, PageHeader, StatusBadge, api, fmtDate, roleLabel, useCollection, useLang, useRoster, useSquads,
  type Added, type Fixture, type Message, type NewsItem, type Payment, type Player,
} from "@/components/client";
import { ALL_GROUPS, GROUPS, ROLE_KEYS, type StaffMember } from "@/lib/data";

type Field = { name: string; label: string; type?: string; options?: (string | [string, string])[]; required?: boolean };

/** A small "add record" form: posts to the API, then reloads the list. */
function AddForm({ url, fields, button, onSaved }: { url: string; fields: Field[]; button: string; onSaved: () => void }) {
  const [state, setState] = useState<{ ok: boolean; text: string } | null>(null);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    try {
      await api("POST", url, Object.fromEntries(new FormData(form)));
      setState({ ok: true, text: "Saved." });
      form.reset();
      onSaved();
    } catch (x) {
      setState({ ok: false, text: (x as Error).message });
    }
  }
  return (
    <form className="card" onSubmit={submit} style={{ marginBottom: 20 }}>
      <div className="row">
        {fields.map((f, i) => (
          <div key={f.name} style={f.type === "textarea" ? { gridColumn: "1 / -1" } : undefined}>
            <label htmlFor={url + f.name} style={i < 2 ? { marginTop: 0 } : undefined}>{f.label}</label>
            {f.options ? (
              <select id={url + f.name} name={f.name}>
                {f.options.map((o) => (typeof o === "string" ? <option key={o}>{o}</option> : <option key={o[0]} value={o[0]}>{o[1]}</option>))}
              </select>
            ) : f.type === "textarea" ? (
              <textarea id={url + f.name} name={f.name} required={f.required} />
            ) : (
              <input id={url + f.name} name={f.name} type={f.type ?? "text"} required={f.required} />
            )}
          </div>
        ))}
      </div>
      <button className="btn" type="submit">{button}</button>
      <Notice state={state} />
    </form>
  );
}

const TABS = ["Payments", "Players", "Squads", "Coaches", "Fixtures", "News", "Messages"] as const;

export default function Dashboard() {
  const { t, lang } = useLang();
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Payments");
  const [open, setOpen] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [gf, setGf] = useState("");
  const [jGroup, setJGroup] = useState("U10");
  const [jState, setJState] = useState<{ ok: boolean; text: string } | null>(null);

  const players = useCollection<Player>("players");
  const payments = useCollection<Payment>("payments");
  const staff = useCollection<StaffMember & { id: string }>("staff");
  const added = useCollection<Added>("squadPlayers");
  const fixtures = useCollection<Fixture>("fixtures");
  const news = useCollection<NewsItem>("news");
  const messages = useCollection<Message>("messages");
  const { squads, reload: reloadSquads } = useSquads();
  const roster = useRoster();

  const act = async (fn: () => Promise<unknown>, reload: () => void) => {
    try { await fn(); } catch (x) { alert((x as Error).message); }
    reload();
  };
  const remove = (col: string, id: string, reload: () => void, what: string) => {
    if (confirm(`Delete this ${what}?`)) act(() => api("DELETE", `/api/${col}/${id}`), reload);
  };
  const logout = async () => {
    await api("DELETE", "/api/auth");
    router.replace("/");
    router.refresh();
  };

  const pending = payments.rows.filter((p) => p.status === "pending").sort((a, b) => a.createdAt - b.createdAt);
  const shown = players.rows
    .filter((p) => (!gf || p.group === gf) && (!q || `${p.name} ${p.phone} ${p.parent}`.toLowerCase().includes(q.toLowerCase())))
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));

  async function saveJersey(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget));
    try {
      await api("POST", "/api/jerseys", { id: d.player, number: d.number });
      setJState({ ok: true, text: "Jersey saved." });
      reloadSquads();
    } catch (x) {
      setJState({ ok: false, text: (x as Error).message });
    }
  }

  return (
    <>
      <PageHeader title="Staff dashboard" lead="Approve receipts and manage the academy's players, squads, fixtures and news." />
      <section>
        <div className="wrap">
          <div className="kpis">
            <div className="card kpi"><b>{players.rows.length}</b><span>Registrations</span></div>
            <div className="card kpi"><b>{pending.length}</b><span>Receipts to check</span></div>
            <div className="card kpi"><b>{payments.rows.filter((p) => p.status === "verified").length}</b><span>Verified payments</span></div>
            <div className="card kpi"><b>{squads.length}</b><span>Squad players</span></div>
            <div className="card kpi"><b>{messages.rows.length}</b><span>Messages</span></div>
          </div>

          <div className="admin-top" style={{ marginTop: 24 }}>
            <div className="tabs" role="tablist" style={{ marginBottom: 0 }}>
              {TABS.map((x) => <button key={x} className="tab" role="tab" type="button" aria-selected={tab === x} onClick={() => setTab(x)}>{x}</button>)}
            </div>
            <button className="btn sm dark" type="button" onClick={logout}>Sign out</button>
          </div>

          {tab === "Payments" && (
            <>
              <h3 className="sub">Receipts to check</h3>
              {!pending.length && <p className="empty">Nothing waiting.</p>}
              {pending.map((p) => (
                <div className="card rowcard" key={p.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.receipt} alt="Receipt" onClick={() => setOpen(p.receipt)} />
                  <div className="grow"><b>{p.playerName}</b><div className="muted">{p.group} · {new Date(p.createdAt).toLocaleString()}</div></div>
                  <button className="btn sm okb" type="button" onClick={() => act(() => api("PATCH", `/api/payments/${p.id}`, { status: "verified" }), payments.reload)}>Approve</button>
                  <button className="btn sm badb" type="button" onClick={() => act(() => api("PATCH", `/api/payments/${p.id}`, { status: "rejected" }), payments.reload)}>Reject</button>
                </div>
              ))}
              <h3 className="sub">All payments</h3>
              {payments.rows.filter((p) => p.status !== "pending").sort((a, b) => b.createdAt - a.createdAt).map((p) => (
                <div className="card rowcard" key={p.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.receipt} alt="Receipt" onClick={() => setOpen(p.receipt)} />
                  <div className="grow"><b>{p.playerName}</b><div className="muted">{p.group} · {new Date(p.createdAt).toLocaleDateString()}</div></div>
                  <StatusBadge status={p.status} />
                  <button className="btn sm dark" type="button" onClick={() => remove("payments", p.id, payments.reload, "payment")}>Delete</button>
                </div>
              ))}
            </>
          )}

          {tab === "Players" && (
            <>
              <h3 className="sub">Registered players</h3>
              <div className="bar">
                <input placeholder="Search name, parent or phone" aria-label="Search players" value={q} onChange={(e) => setQ(e.target.value)} />
                <select aria-label="Filter by group" value={gf} onChange={(e) => setGf(e.target.value)}>
                  <option value="">All groups</option>
                  {ALL_GROUPS.map((g) => <option key={g}>{g}</option>)}
                </select>
                <a className="btn sm dark" href="/api/export/players">Export CSV</a>
              </div>
              <p className="muted">{players.rows.length} registered{shown.length !== players.rows.length ? ` · ${shown.length} shown` : ""}</p>
              <div className="scroll">
                <table className="tbl">
                  <thead><tr><th>Name</th><th>Age</th><th>Group</th><th>Student ID</th><th>Parent</th><th>Phone</th><th>Status</th><th /></tr></thead>
                  <tbody>
                    {shown.map((p) => (
                      <tr key={p.id}>
                        <td>{p.name}</td><td>{p.age}</td><td>{p.group}</td><td>{p.studentId}</td><td>{p.parent}</td><td>{p.phone}</td>
                        <td>
                          <select aria-label="Status" value={p.status} onChange={(e) => act(() => api("PATCH", `/api/players/${p.id}`, { status: e.target.value }), players.reload)}>
                            {["Pending", "Active", "Inactive"].map((s) => <option key={s}>{s}</option>)}
                          </select>
                        </td>
                        <td><button className="btn sm badb" type="button" onClick={() => remove("players", p.id, players.reload, "player")}>Delete</button></td>
                      </tr>
                    ))}
                    {!shown.length && <tr><td colSpan={8}>No players yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {tab === "Squads" && (
            <>
              <h3 className="sub">Add player to squad</h3>
              <AddForm url="/api/squadPlayers" button="Add player" onSaved={() => { added.reload(); reloadSquads(); }} fields={[
                { name: "name", label: "Name", required: true },
                { name: "group", label: "Age group", options: [...GROUPS] },
                { name: "pos", label: "Position", options: [["GK", t("posGK")], ["DEF", t("posDEF")], ["MID", t("posMID")], ["FWD", t("posFWD")]] },
                { name: "jersey", label: "Jersey number", type: "number" },
              ]} />
              {added.rows.map((s) => (
                <div className="card rowcard" key={s.id}>
                  <div className="grow"><b>{s.name}</b><div className="muted">{s.group} · {s.pos}{s.jersey ? ` · #${s.jersey}` : ""}</div></div>
                  <button className="btn sm badb" type="button" onClick={() => remove("squadPlayers", s.id, () => { added.reload(); reloadSquads(); }, "squad player")}>Delete</button>
                </div>
              ))}
              <h3 className="sub">Jersey numbers</h3>
              <form className="card" onSubmit={saveJersey}>
                <div className="row">
                  <div><label htmlFor="jg" style={{ marginTop: 0 }}>Age group</label>
                    <select id="jg" value={jGroup} onChange={(e) => setJGroup(e.target.value)}>{ALL_GROUPS.map((g) => <option key={g}>{g}</option>)}</select></div>
                  <div><label htmlFor="jp" style={{ marginTop: 0 }}>Player</label>
                    <select id="jp" name="player" required>{roster.filter((p) => p.group === jGroup).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                </div>
                <label htmlFor="jn">Jersey number</label>
                <input id="jn" name="number" type="number" min={0} max={99} required />
                <button className="btn" type="submit">Save jersey</button>
                <Notice state={jState} />
              </form>
            </>
          )}

          {tab === "Coaches" && (
            <>
              <h3 className="sub">Add coach or staff</h3>
              <AddForm url="/api/staff" button="Add coach" onSaved={staff.reload} fields={[
                { name: "name", label: "Name", required: true },
                { name: "role", label: "Role (pick or type your own)", required: true },
                { name: "phone", label: "Phone", type: "tel" },
                { name: "jersey", label: "Jersey number", type: "number" },
              ]} />
              <p className="muted">Standard roles are translated when typed as: {ROLE_KEYS.map((k) => `${k} (${t(k)})`).join(", ")}.</p>
              {staff.rows.map((s) => (
                <div className="card rowcard" key={s.id}>
                  <div className="grow"><b>{s.name}</b><div className="muted">{roleLabel(t, s.role)}{s.jersey ? ` · #${s.jersey}` : ""}{s.phone ? ` · ${s.phone}` : ""}</div></div>
                  <button className="btn sm badb" type="button" onClick={() => remove("staff", s.id, staff.reload, "coach")}>Delete</button>
                </div>
              ))}
            </>
          )}

          {tab === "Fixtures" && (
            <>
              <h3 className="sub">Add match</h3>
              <AddForm url="/api/fixtures" button="Add match" onSaved={fixtures.reload} fields={[
                { name: "group", label: "Our team", options: [...ALL_GROUPS] },
                { name: "opponent", label: "Opponent", required: true },
                { name: "date", label: "Date", type: "date", required: true },
                { name: "time", label: "Kick-off", type: "time" },
                { name: "venue", label: "Venue" },
                { name: "side", label: "Home or away", options: [["home", "Home"], ["away", "Away"]] },
                { name: "competition", label: "Competition" },
                { name: "scoreUs", label: "Our score (after the match)", type: "number" },
                { name: "scoreThem", label: "Their score (after the match)", type: "number" },
              ]} />
              {[...fixtures.rows].sort((a, b) => b.date.localeCompare(a.date)).map((f) => (
                <div className="card rowcard" key={f.id}>
                  <div className="grow"><b>{f.group} vs {f.opponent}</b><div className="muted">{fmtDate(f.date, lang)} {f.time} · {f.venue}{f.scoreUs !== "" ? ` · ${f.scoreUs}–${f.scoreThem}` : ""}</div></div>
                  <button className="btn sm dark" type="button" onClick={() => {
                    const s = prompt("Final score, ours–theirs (for example 2-1)", f.scoreUs !== "" ? `${f.scoreUs}-${f.scoreThem}` : "");
                    const m = s && /^\s*(\d{1,2})\s*[-–:]\s*(\d{1,2})\s*$/.exec(s);
                    if (m) act(() => api("PATCH", `/api/fixtures/${f.id}`, { scoreUs: m[1], scoreThem: m[2] }), fixtures.reload);
                  }}>Set score</button>
                  <button className="btn sm badb" type="button" onClick={() => remove("fixtures", f.id, fixtures.reload, "match")}>Delete</button>
                </div>
              ))}
            </>
          )}

          {tab === "News" && (
            <>
              <h3 className="sub">Post news</h3>
              <AddForm url="/api/news" button="Publish" onSaved={news.reload} fields={[
                { name: "title", label: "Title", required: true },
                { name: "date", label: "Date", type: "date", required: true },
                { name: "body", label: "Text", type: "textarea", required: true },
              ]} />
              {[...news.rows].sort((a, b) => b.date.localeCompare(a.date)).map((n) => (
                <div className="card rowcard" key={n.id}>
                  <div className="grow"><b>{n.title}</b><div className="muted">{fmtDate(n.date, lang)}</div></div>
                  <button className="btn sm badb" type="button" onClick={() => remove("news", n.id, news.reload, "post")}>Delete</button>
                </div>
              ))}
            </>
          )}

          {tab === "Messages" && (
            <>
              <h3 className="sub">Messages from the contact page</h3>
              {!messages.rows.length && <p className="empty">No messages.</p>}
              {[...messages.rows].sort((a, b) => b.createdAt - a.createdAt).map((m) => (
                <div className="card rowcard" key={m.id}>
                  <div className="grow">
                    <b>{m.name}</b>
                    <div className="muted">{[m.phone, m.email, new Date(m.createdAt).toLocaleString()].filter(Boolean).join(" · ")}</div>
                    <p style={{ whiteSpace: "pre-line", marginTop: 8 }}>{m.message}</p>
                  </div>
                  <button className="btn sm badb" type="button" onClick={() => remove("messages", m.id, messages.reload, "message")}>Delete</button>
                </div>
              ))}
            </>
          )}
        </div>
      </section>
      <Lightbox src={open} onClose={() => setOpen(null)} />
    </>
  );
}
