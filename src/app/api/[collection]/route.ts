import { NextResponse } from "next/server";
import { isStaff } from "@/lib/auth";
import { COLLECTIONS, Invalid, clean } from "@/lib/collections";
import { NotConfigured, files, get, list, newId, put, type Row } from "@/lib/db";
import { decodeJpeg, savePhoto } from "@/lib/photos";

type Ctx = { params: Promise<{ collection: string }> };
const err = (message: string, status: number) => NextResponse.json({ error: message }, { status });

export async function GET(_req: Request, { params }: Ctx) {
  const { collection } = await params;
  const def = COLLECTIONS[collection];
  if (!def) return err("Not found", 404);
  const staff = await isStaff();
  if (!staff && !def.publicRead) return err("Staff only", 401);
  try {
    const rows = await list(collection);
    const view = !staff && def.publicView ? rows.map(def.publicView) : rows;
    return NextResponse.json(view, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error(e);
    return err("Could not load", 500);
  }
}

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
    let old: Row | null = null;
    if (def.upsert) {
      if (typeof body.id !== "string" || !/^[\w-]{1,80}$/.test(body.id)) throw new Invalid("Invalid id");
      id = body.id;
      old = await get(collection, id);
    }

    if (collection === "payments") {
      // The receipt photo arrives as a JPEG data URL; store it as a file.
      if (!body.receipt) throw new Invalid("Receipt photo is required");
      await files.put(`${id}.jpg`, decodeJpeg(body.receipt, "Receipt photo"));
      data.receipt = `/api/uploads/${id}.jpg`;
    }

    if (def.photo && staff) {
      if (def.photo === "required" && !body.photo && !old?.photo) throw new Invalid("Please choose a photo");
      const photo = await savePhoto(id, body.photo, old?.photo);
      data.photo = photo ?? old?.photo ?? "";
    }

    const row: Row = { id, createdAt: old?.createdAt ?? Date.now(), ...data };
    await put(collection, row);
    return NextResponse.json(row, { status: 201 });
  } catch (e) {
    if (e instanceof Invalid) return err(e.message, 400);
    if (e instanceof NotConfigured) return err(e.message, 503);
    console.error(e);
    return err("Could not save", 500);
  }
}
