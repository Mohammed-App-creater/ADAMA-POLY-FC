import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { isStaff } from "@/lib/auth";
import { COLLECTIONS, Invalid, clean } from "@/lib/collections";
import { UPLOAD_DIR, tx } from "@/lib/db";
import { removeUpload, savePhoto } from "@/lib/photos";

type Ctx = { params: Promise<{ collection: string; id: string }> };
const err = (message: string, status: number) => NextResponse.json({ error: message }, { status });

// Updates and deletes are staff only.
export async function PATCH(req: Request, { params }: Ctx) {
  const { collection, id } = await params;
  const def = COLLECTIONS[collection];
  if (!def) return err("Not found", 404);
  if (!(await isStaff())) return err("Staff only", 401);
  try {
    const body = await req.json();
    if (!body || typeof body !== "object") throw new Invalid("Invalid request");
    const data = clean(def, body, true, true);
    if (def.photo && "photo" in body) {
      const existing = await tx((db) => db[collection]?.find((x) => x.id === id));
      if (!existing) return err("Not found", 404);
      const photo = await savePhoto(id, body.photo, existing.photo);
      if (photo !== undefined) data.photo = photo;
    }
    const row = await tx((db) => {
      const r = db[collection]?.find((x) => x.id === id);
      if (r) Object.assign(r, data);
      return r;
    }, true);
    return row ? NextResponse.json(row) : err("Not found", 404);
  } catch (e) {
    if (e instanceof Invalid) return err(e.message, 400);
    return err("Invalid request", 400);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { collection, id } = await params;
  if (!COLLECTIONS[collection]) return err("Not found", 404);
  if (!(await isStaff())) return err("Staff only", 401);
  const removed = await tx((db) => {
    const list = db[collection] ?? [];
    const i = list.findIndex((x) => x.id === id);
    return i >= 0 ? list.splice(i, 1)[0] : null;
  }, true);
  if (!removed) return err("Not found", 404);
  if (collection === "payments" && /^[\w-]+$/.test(id)) {
    await fs.rm(path.join(UPLOAD_DIR, `${id}.jpg`), { force: true });
  }
  await removeUpload(removed.photo);
  return NextResponse.json({ ok: true });
}
