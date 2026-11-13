// Storage for records and uploaded images, with two backends:
//  - Redis over HTTPS (Upstash) when KV_REST_API_URL / UPSTASH_REDIS_REST_URL is
//    set. This is what the live site on Vercel uses, because Vercel's disk is
//    read-only and nothing written to it would survive.
//  - A JSON file plus an uploads folder under ./data for local development.
import { promises as fs } from "fs";
import path from "path";
import { CONTACT, GALLERY, GROUPS, OLD_ADDRESS, OLD_PHONE, SCHEDULE, STAFF, baseSquad } from "./data";

export type Row = { id: string; createdAt: number; [k: string]: unknown };

/** Thrown when the site is deployed without a database to save into. */
export class NotConfigured extends Error {
  constructor() {
    super("Saving is not set up yet. Connect an Upstash Redis database to this Vercel project, then redeploy.");
  }
}

/* ---------- first-run content ---------- */
// Each collection is filled once with this starter content; after that it
// belongs to the staff, who can edit or delete every row from the admin.
function seeds(): Record<string, Row[]> {
  const now = Date.now();
  const at = (i: number) => now + i; // keeps the starter rows in order
  return {
    fixtures: [
      { id: "fx1", createdAt: now, group: "U15", opponent: "Sample: Nazret Youth FC", date: "2026-11-21", time: "10:00", venue: "College sports ground", side: "home", competition: "Friendly", scoreUs: "", scoreThem: "" },
      { id: "fx2", createdAt: now, group: "U17", opponent: "Sample: Bishoftu Academy", date: "2026-11-28", time: "15:00", venue: "Bishoftu Stadium", side: "away", competition: "Friendly", scoreUs: "", scoreThem: "" },
      { id: "fx3", createdAt: now, group: "U13", opponent: "Sample: Mojo Stars", date: "2026-10-31", time: "09:30", venue: "College sports ground", side: "home", competition: "Friendly", scoreUs: "3", scoreThem: "1" },
    ],
    news: [
      { id: "nw1", createdAt: now, title: "Registration is open for the new season", date: "2026-11-01", body: "Sample post. Players aged 8 to 17 can now register online. After you send the form, our staff will call you with trial dates and fees." },
      { id: "nw2", createdAt: now - 1, title: "Welcome to our new website", date: "2026-10-25", body: "Sample post. You can now see squads, the training timetable and fixtures, and send your monthly fee receipt online. Staff can replace these sample posts from the staff page." },
    ],
    staff: STAFF.map((s, i) => ({ id: `st${i + 1}`, createdAt: at(i), name: s.name, role: s.role, phone: "", jersey: "", photo: s.photo ?? "" })),
    squadPlayers: GROUPS.flatMap(baseSquad).map((p, i) => ({
      id: p.id, createdAt: at(i), name: p.name, group: p.group, pos: p.pos, jersey: p.number,
      starter: p.starter ? "yes" : "no", foot: p.foot ?? "", photo: "",
    })),
    schedule: SCHEDULE.map((s, i) => ({ id: s.group, createdAt: at(i), ...s })),
    gallery: GALLERY.map((photo, i) => ({ id: `g${i + 1}`, createdAt: at(i), caption: "", photo })),
    settings: [{ id: "site", createdAt: now, ...CONTACT }],
  };
}

/* ---------- backends ---------- */
type Store = {
  all(col: string): Promise<Row[]>;
  get(col: string, id: string): Promise<Row | null>;
  put(col: string, rows: Row[]): Promise<void>;
  del(col: string, id: string): Promise<void>;
  seeded(): Promise<string[]>;
  markSeeded(col: string): Promise<void>;
  putFile(name: string, data: Buffer): Promise<void>;
  getFile(name: string): Promise<Buffer | null>;
  delFile(name: string): Promise<void>;
};

const byAge = (rows: Row[]) => rows.sort((a, b) => a.createdAt - b.createdAt);

function redisStore(url: string, token: string): Store {
  const K = "apfc:";
  async function cmd<T>(...args: string[]): Promise<T> {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(args),
      cache: "no-store",
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json || json.error) throw new Error(`Database error: ${json?.error ?? res.status}`);
    return json.result as T;
  }
  return {
    async all(col) {
      const flat = await cmd<string[]>("HGETALL", K + col);
      const rows: Row[] = [];
      for (let i = 1; i < flat.length; i += 2) rows.push(JSON.parse(flat[i]));
      return byAge(rows);
    },
    async get(col, id) {
      const v = await cmd<string | null>("HGET", K + col, id);
      return v ? JSON.parse(v) : null;
    },
    async put(col, rows) {
      if (rows.length) await cmd("HSET", K + col, ...rows.flatMap((r) => [r.id, JSON.stringify(r)]));
    },
    async del(col, id) { await cmd("HDEL", K + col, id); },
    seeded: () => cmd<string[]>("SMEMBERS", K + "seeded"),
    async markSeeded(col) { await cmd("SADD", K + "seeded", col); },
    async putFile(name, data) { await cmd("SET", K + "file:" + name, data.toString("base64")); },
    async getFile(name) {
      const v = await cmd<string | null>("GET", K + "file:" + name);
      return v ? Buffer.from(v, "base64") : null;
    },
    async delFile(name) { await cmd("DEL", K + "file:" + name); },
  };
}

function fileStore(): Store {
  const DATA_DIR = path.join(process.cwd(), "data");
  const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
  const FILE = path.join(DATA_DIR, "db.json");
  type Disk = { _seeded?: string[] } & Record<string, Row[]>;

  async function load(): Promise<Disk> {
    try {
      const db = JSON.parse(await fs.readFile(FILE, "utf8")) as Disk;
      // Files written before seeding was tracked already hold these two.
      db._seeded ??= ["fixtures", "news"];
      return db;
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "ENOENT") return { _seeded: [] } as unknown as Disk;
      throw e;
    }
  }
  async function save(db: Disk) {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const tmp = FILE + ".tmp";
    await fs.writeFile(tmp, JSON.stringify(db, null, 1));
    await fs.rename(tmp, FILE);
  }
  // One queue for all reads and writes so concurrent requests cannot corrupt the file.
  let queue: Promise<unknown> = Promise.resolve();
  function tx<T>(fn: (db: Disk) => T, write = false): Promise<T> {
    const run = queue.then(async () => {
      const db = await load();
      const result = fn(db);
      if (write) await save(db);
      return result;
    });
    queue = run.catch(() => {});
    return run;
  }
  return {
    all: (col) => tx((db) => byAge([...(db[col] ?? [])])),
    get: (col, id) => tx((db) => db[col]?.find((r) => r.id === id) ?? null),
    put: (col, rows) => tx((db) => {
      const list = (db[col] ??= []);
      for (const row of rows) {
        const i = list.findIndex((r) => r.id === row.id);
        if (i >= 0) list[i] = row;
        else list.push(row);
      }
    }, true),
    del: (col, id) => tx((db) => { db[col] = (db[col] ?? []).filter((r) => r.id !== id); }, true),
    seeded: () => tx((db) => db._seeded ?? []),
    markSeeded: (col) => tx((db) => { (db._seeded ??= []).push(col); }, true),
    async putFile(name, data) {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
      await fs.writeFile(path.join(UPLOAD_DIR, name), data);
    },
    async getFile(name) {
      try {
        return await fs.readFile(path.join(UPLOAD_DIR, name));
      } catch {
        return null;
      }
    },
    async delFile(name) { await fs.rm(path.join(UPLOAD_DIR, name), { force: true }); },
  };
}

/** Deployed without a database: show the starter content, refuse to save. */
function readOnlyStore(): Store {
  const data = seeds();
  const no = async () => { throw new NotConfigured(); };
  return {
    all: async (col) => byAge([...(data[col] ?? [])]),
    get: async (col, id) => data[col]?.find((r) => r.id === id) ?? null,
    put: no, del: no, markSeeded: no, putFile: no, delFile: no,
    seeded: async () => [...Object.keys(data), "contact-2026-11", "name-2026-11"], // nothing to seed or migrate
    getFile: async () => null,
  };
}

function pick(): Store {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) return redisStore(url.replace(/\/+$/, ""), token);
  if (process.env.VERCEL) return readOnlyStore();
  return fileStore();
}

let store: Store | undefined;
let seeding: Promise<void> | undefined;

/** The active backend, with any not-yet-seeded collection filled first. */
async function db(): Promise<Store> {
  const s = (store ??= pick());
  seeding ??= (async () => {
    const done = new Set(await s.seeded());
    for (const [col, rows] of Object.entries(seeds())) {
      if (done.has(col)) continue;
      await s.put(col, rows);
      await s.markSeeded(col);
    }
    // One-time: databases started before the real phone and bank account were
    // known still hold the placeholders. Fill them in, but never overwrite
    // anything staff typed themselves.
    if (!done.has("contact-2026-11")) {
      const site = await s.get("settings", "site");
      if (site) {
        if (site.phone === OLD_PHONE) site.phone = CONTACT.phone;
        if (!site.bankAccount) site.bankAccount = CONTACT.bankAccount;
        await s.put("settings", [site]);
      }
      await s.markSeeded("contact-2026-11");
    }
    // One-time: the address still carrying the old academy name.
    if (!done.has("name-2026-11")) {
      const site = await s.get("settings", "site");
      if (site && site.address === OLD_ADDRESS) {
        site.address = CONTACT.address;
        await s.put("settings", [site]);
      }
      await s.markSeeded("name-2026-11");
    }
  })();
  try {
    await seeding;
  } catch (e) {
    seeding = undefined; // try again on the next request
    throw e;
  }
  return s;
}

/* ---------- public API ---------- */
export const list = async (col: string) => (await db()).all(col);
export const get = async (col: string, id: string) => (await db()).get(col, id);
export const put = async (col: string, row: Row) => (await db()).put(col, [row]);
/** Delete a row and return it, or null if it did not exist. */
export async function remove(col: string, id: string) {
  const s = await db();
  const row = await s.get(col, id);
  if (row) await s.del(col, id);
  return row;
}

const FILE_NAME = /^[\w-]{1,120}\.jpg$/;
export const files = {
  async put(name: string, data: Buffer) {
    if (!FILE_NAME.test(name)) throw new Error("Bad file name");
    await (await db()).putFile(name, data);
  },
  get: async (name: string) => (FILE_NAME.test(name) ? (await db()).getFile(name) : null),
  async del(name: string) {
    if (FILE_NAME.test(name)) await (await db()).delFile(name);
  },
};

export function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
