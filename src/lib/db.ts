// Small JSON-file database. All reads and writes go through one queue so
// concurrent requests cannot corrupt the file. Swap this module for a real
// database (Postgres, SQLite) when deploying to a host without a writable disk.
import { promises as fs } from "fs";
import path from "path";

export type Row = { id: string; createdAt: number; [k: string]: unknown };
export type DB = Record<string, Row[]>;

export const DATA_DIR = path.join(process.cwd(), "data");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
const FILE = path.join(DATA_DIR, "db.json");

const now = Date.now();
function seed(): DB {
  return {
    players: [],
    payments: [],
    staff: [],
    squadPlayers: [],
    jerseys: [],
    messages: [],
    fixtures: [
      { id: "fx1", createdAt: now, group: "U15", opponent: "Sample: Nazret Youth FC", date: "2026-11-21", time: "10:00", venue: "College sports ground", side: "home", competition: "Friendly", scoreUs: "", scoreThem: "" },
      { id: "fx2", createdAt: now, group: "U17", opponent: "Sample: Bishoftu Academy", date: "2026-11-28", time: "15:00", venue: "Bishoftu Stadium", side: "away", competition: "Friendly", scoreUs: "", scoreThem: "" },
      { id: "fx3", createdAt: now, group: "U13", opponent: "Sample: Mojo Stars", date: "2026-10-31", time: "09:30", venue: "College sports ground", side: "home", competition: "Friendly", scoreUs: "3", scoreThem: "1" },
    ],
    news: [
      { id: "nw1", createdAt: now, title: "Registration is open for the new season", date: "2026-11-01", body: "Sample post. Players aged 8 to 17 can now register online. After you send the form, our staff will call you with trial dates and fees." },
      { id: "nw2", createdAt: now - 1, title: "Welcome to our new website", date: "2026-10-25", body: "Sample post. You can now see squads, the training timetable and fixtures, and send your monthly fee receipt online. Staff can replace these sample posts from the staff page." },
    ],
  };
}

async function load(): Promise<DB> {
  try {
    return { ...seed0(), ...JSON.parse(await fs.readFile(FILE, "utf8")) };
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return seed();
    throw e;
  }
}
// Empty collections, so a db.json written by an older version still has every key.
function seed0(): DB {
  return Object.fromEntries(Object.keys(seed()).map((k) => [k, []]));
}

async function save(db: DB) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = FILE + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(db, null, 1));
  await fs.rename(tmp, FILE);
}

let queue: Promise<unknown> = Promise.resolve();

/** Run fn against the database. Pass write=true to persist changes fn made. */
export function tx<T>(fn: (db: DB) => T | Promise<T>, write = false): Promise<T> {
  const run = queue.then(async () => {
    const db = await load();
    const result = await fn(db);
    if (write) await save(db);
    return result;
  });
  queue = run.catch(() => {});
  return run;
}

export function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
