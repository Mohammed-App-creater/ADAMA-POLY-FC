import { files } from "@/lib/db";

// Serves uploaded images: receipt photos and profile / gallery photos.
export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const file = await files.get(name).catch(() => null);
  if (!file) return new Response("Not found", { status: 404 });
  // File names are never reused, so a stored image can be cached for good.
  return new Response(new Uint8Array(file), {
    headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, max-age=31536000, immutable" },
  });
}
