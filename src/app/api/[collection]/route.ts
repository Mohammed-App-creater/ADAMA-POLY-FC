import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { isStaff } from "@/lib/auth";
import { COLLECTIONS, Invalid, clean } from "@/lib/collections";
import { UPLOAD_DIR, newId, tx, type Row } from "@/lib/db";

type Ctx = { params: Promise<{ collection: string }> };
const err = (message: string, status: number) => NextResponse.json({ error: message }, { status });

export async function GET(_req: Request, { params }: Ctx) {
  const { collection } = await params;
  const def = COLLECTIONS[collection];
  if (!def) return err("Not found", 404);
  const staff = await isStaff();
  if (!staff && !def.publicRead) return err("Staff only", 401);
  const rows = await tx((db) => db[collection] ?? []);
  const view = !staff && def.publicView ? rows.map(def.publicView) : rows;
  return NextResponse.json(view, { headers: { "Cache-Control": "no-store" } });
}

const MAX_RECEIPT = 1_500_000; // bytes of base64

export async function POST(req: Request, { params }: Ctx) {
  const { collection } = await params;
  const def = COLLECTIONS[collection];
  if (!def) return err("Not found", 404);
  const staff = await isStaff();
  if (!staff && !def.publicCreate) return err("Staff only", 401);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
    if (!body || typeof body !== "object") throw new Error();
  } catch {
    return err("Invalid request", 400);
  }

  try {
    const data = clean(def, body, staff, false);
    let id = newId();
    if (def.upsert) {
      if (typeof body.id !== "string" || !/^[\w-]{1,80}$/.test(body.id)) throw new Invalid("Invalid id");
      id = body.id;
    }

    if (collection === "payments") {
      // The receipt photo arrives as a JPEG data URL; store it as a file.
      const m = typeof body.receipt === "string" && /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(body.receipt);
      if (!m) throw new Invalid("Receipt photo is required");
      if (m[1].length > MAX_RECEIPT) throw new Invalid("Receipt photo is too large");
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
      await fs.writeFile(path.join(UPLOAD_DIR, `${id}.jpg`), Buffer.from(m[1], "base64"));
      data.receipt = `/api/uploads/${id}.jpg`;
    }

    const row: Row = { id, createdAt: Date.now(), ...data };
    await tx((db) => {
      const list = (db[collection] ??= []);
      const i = list.findIndex((r) => r.id === id);
      if (i >= 0) list[i] = row;
      else list.push(row);
    }, true);
    return NextResponse.json(row, { status: 201 });
  } catch (e) {
    if (e instanceof Invalid) return err(e.message, 400);
    console.error(e);
    return err("Could not save", 500);
  }
}
