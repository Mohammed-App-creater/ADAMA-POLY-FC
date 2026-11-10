// Which collections the API exposes, who may read or write them, and how
// incoming fields are validated. Anything not listed here is rejected.
import type { Row } from "./db";

export const GROUPS = ["U10", "U13", "U15", "U17"] as const;
export const ALL_GROUPS = [...GROUPS, "Senior"] as const;

type Check = (v: unknown) => unknown;
export class Invalid extends Error {}

const str = (max = 200, def = ""): Check => (v) => {
  if (v == null) return def;
  if (typeof v !== "string" && typeof v !== "number") throw new Invalid("Invalid text");
  return String(v).trim().slice(0, max);
};
const oneOf = (list: readonly string[], def?: string): Check => (v) => {
  if (v == null && def !== undefined) return def;
  if (typeof v !== "string" || !list.includes(v)) throw new Invalid("Invalid choice");
  return v;
};
const int = (min: number, max: number): Check => (v) => {
  const n = Number(v);
  if (!Number.isInteger(n) || n < min || n > max) throw new Invalid(`Number must be ${min}-${max}`);
  return n;
};
const date: Check = (v) => {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) throw new Invalid("Invalid date");
  return v;
};

export type Def = {
  fields: Record<string, Check>;
  required: string[];
  /** Fields only staff may set (others get the default). */
  staffFields?: string[];
  publicRead: boolean;
  publicCreate: boolean;
  /** What a visitor who is not staff sees of each row. */
  publicView?: (r: Row) => Record<string, unknown>;
  /** Row id comes from the request body (create-or-replace). */
  upsert?: boolean;
};

export const COLLECTIONS: Record<string, Def> = {
  players: {
    fields: {
      name: str(120), age: int(5, 40), group: oneOf(ALL_GROUPS), studentId: str(60),
      parent: str(120), phone: str(40), status: oneOf(["Pending", "Active", "Inactive"], "Pending"),
    },
    required: ["name", "age", "group", "studentId", "parent", "phone"],
    staffFields: ["status"],
    publicRead: true,
    publicCreate: true,
    publicView: (r) => ({ id: r.id, name: r.name, group: r.group }),
  },
  payments: {
    fields: {
      playerId: str(80), playerName: str(120), group: str(20),
      status: oneOf(["pending", "verified", "rejected"], "pending"),
    },
    required: ["playerId", "playerName"],
    staffFields: ["status"],
    publicRead: true,
    publicCreate: true,
  },
  staff: {
    fields: { name: str(120), role: str(80), phone: str(40), jersey: str(3) },
    required: ["name", "role"],
    publicRead: true,
    publicCreate: false,
  },
  squadPlayers: {
    fields: { name: str(120), group: oneOf(GROUPS), pos: oneOf(["GK", "DEF", "MID", "FWD"]), jersey: str(3) },
    required: ["name", "group", "pos"],
    publicRead: true,
    publicCreate: false,
  },
  jerseys: {
    fields: { number: str(3) },
    required: ["number"],
    publicRead: true,
    publicCreate: false,
    upsert: true,
  },
  fixtures: {
    fields: {
      group: oneOf(ALL_GROUPS), opponent: str(120), date, time: str(10), venue: str(120),
      side: oneOf(["home", "away"], "home"), competition: str(80), scoreUs: str(3), scoreThem: str(3),
    },
    required: ["group", "opponent", "date"],
    publicRead: true,
    publicCreate: false,
  },
  news: {
    fields: { title: str(160), date, body: str(5000) },
    required: ["title", "date", "body"],
    publicRead: true,
    publicCreate: false,
  },
  messages: {
    fields: { name: str(120), phone: str(40), email: str(120), message: str(2000), read: oneOf(["yes", "no"], "no") },
    required: ["name", "message"],
    staffFields: ["read"],
    publicRead: false,
    publicCreate: true,
  },
};

/** Validate a request body. partial=true checks only the fields that were sent. */
export function clean(def: Def, body: Record<string, unknown>, staff: boolean, partial: boolean) {
  const out: Record<string, unknown> = {};
  for (const [key, check] of Object.entries(def.fields)) {
    const locked = !staff && def.staffFields?.includes(key);
    if (partial) {
      if (!(key in body) || locked) continue;
      out[key] = check(body[key]);
    } else {
      out[key] = check(locked ? undefined : body[key]);
    }
    if (def.required.includes(key) && out[key] === "") throw new Invalid(`Missing ${key}`);
  }
  return out;
}
