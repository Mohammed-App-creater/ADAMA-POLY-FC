// Profile photos for coaches and players. The admin form sends a JPEG data URL
// (or "" to remove the photo); we store it as a file next to the receipts.
import { promises as fs } from "fs";
import path from "path";
import { Invalid } from "./collections";
import { UPLOAD_DIR } from "./db";

const MAX_PHOTO = 1_500_000; // bytes of base64
const URL_PREFIX = "/api/uploads/";

/** Delete a stored upload given its public URL. Ignores anything that is not ours. */
export async function removeUpload(url: unknown) {
  if (typeof url !== "string" || !url.startsWith(URL_PREFIX)) return;
  const name = url.slice(URL_PREFIX.length);
  if (!/^[\w-]+\.jpg$/.test(name)) return;
  await fs.rm(path.join(UPLOAD_DIR, name), { force: true });
}

/**
 * Handle the `photo` value of a request body.
 * Returns the new URL, "" when the photo was removed, or undefined for no change.
 * Each upload gets a fresh file name so browsers and the image optimizer never
 * show a stale copy after a photo is replaced.
 */
export async function savePhoto(id: string, input: unknown, old: unknown): Promise<string | undefined> {
  if (input === undefined || input === null) return undefined;
  if (input === "") {
    await removeUpload(old);
    return "";
  }
  const m = typeof input === "string" && /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(input);
  if (!m) throw new Invalid("Photo must be an image");
  if (m[1].length > MAX_PHOTO) throw new Invalid("Photo is too large");
  if (!/^[\w-]{1,80}$/.test(id)) throw new Invalid("Invalid id");
  const name = `${id}-p${Date.now().toString(36)}.jpg`;
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, name), Buffer.from(m[1], "base64"));
  await removeUpload(old);
  return URL_PREFIX + name;
}
