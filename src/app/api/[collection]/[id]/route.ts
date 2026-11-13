import { NextResponse } from "next/server";
import { isStaff } from "@/lib/auth";
import { COLLECTIONS, Invalid, clean } from "@/lib/collections";
import { NotConfigured, files, get, put, remove } from "@/lib/db";
import { removeUpload, savePhoto } from "@/lib/photos";

type Ctx = { params: Promise<{ collection: string; id: string }> };
const err = (message: string, status: number) => NextResponse.json({ error: message }, { status });
const fail = (e: unknown, fallback: string) => {
  if (e instanceof Invalid) return err(e.message, 400);
  if (e instanceof NotConfigured) return err(e.message, 503);
  console.error(e);
  return err(fallback, 500);
};

// Updates and deletes are staff only.
export async function PATCH(req: Request, { params }: Ctx) {
  const { collection, id } = await params;
  const def = COLLECTIONS[collection];
  if (!def) return err("Not found", 404);
  if (!(await isStaff())) return err("Staff only", 401);
  let body: Record<string, unknown>;
  try {
    body = await req.json();
    if (!body || typeof body !== "object") throw new Error();
  } catch {
    return err("Invalid request", 400);
  }
  try {
    const data = clean(def, body, true, true);
    const row = await get(collection, id);
    if (!row) return err("Not found", 404);
    if (def.photo && "photo" in body) {
      if (body.photo === "" && def.photo === "required") throw new Invalid("Please choose a photo");
      const photo = await savePhoto(id, body.photo, row.photo);
      if (photo !== undefined) data.photo = photo;
    }
    Object.assign(row, data);
    await put(collection, row);
    return NextResponse.json(row);
  } catch (e) {
    return fail(e, "Could not save");
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { collection, id } = await params;
  if (!COLLECTIONS[collection]) return err("Not found", 404);
  if (!(await isStaff())) return err("Staff only", 401);
  try {
    const removed = await remove(collection, id);
    if (!removed) return err("Not found", 404);
    if (collection === "payments") await files.del(`${id}.jpg`);
    await removeUpload(removed.photo);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e, "Could not delete");
  }
}
