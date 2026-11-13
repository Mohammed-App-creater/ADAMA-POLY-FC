// Uploaded photos (coaches, players, gallery). The admin form sends a JPEG data
// URL, or "" to remove the photo; the image is kept in the site's storage.
import { Invalid } from "./collections";
import { files } from "./db";

const MAX_PHOTO = 1_500_000; // bytes of base64
const URL_PREFIX = "/api/uploads/";

/** Decode a JPEG data URL sent by the browser. */
export function decodeJpeg(input: unknown, what: string): Buffer {
  const m = typeof input === "string" && /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(input);
  if (!m) throw new Invalid(`${what} must be an image`);
  if (m[1].length > MAX_PHOTO) throw new Invalid(`${what} is too large`);
  return Buffer.from(m[1], "base64");
}

/** Delete a stored upload given its public URL. Ignores anything that is not ours. */
export async function removeUpload(url: unknown) {
  if (typeof url === "string" && url.startsWith(URL_PREFIX)) await files.del(url.slice(URL_PREFIX.length));
}

/**
 * Handle the `photo` value of a request body.
 * Returns the new URL, "" when the photo was removed, or undefined for no change.
 * Each upload gets a fresh file name so browsers and the image optimizer never
 * show a stale copy after a photo is replaced.
 */
export async function savePhoto(id: string, input: unknown, old: unknown): Promise<string | undefined> {
  if (input === undefined || input === null || input === old) return undefined;
  if (input === "") {
    await removeUpload(old);
    return "";
  }
  const data = decodeJpeg(input, "Photo");
  if (!/^[\w-]{1,80}$/.test(id)) throw new Invalid("Invalid id");
  const name = `${id}-p${Date.now().toString(36)}.jpg`;
  await files.put(name, data);
  await removeUpload(old);
  return URL_PREFIX + name;
}
