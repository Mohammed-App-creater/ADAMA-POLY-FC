"use client";
import Image from "next/image";
import { useState } from "react";
import { Lightbox, PageHeader, useCollection, useLang, type GalleryPhoto } from "@/components/client";

export default function Gallery() {
  const { t } = useLang();
  const [open, setOpen] = useState<string | null>(null);
  const photos = useCollection<GalleryPhoto>("gallery").rows.filter((g) => !g.coach);
  return (
    <>
      <PageHeader title={t("galleryTitle")} lead={t("galleryLead")} />
      <section>
        <div className="wrap">
          <div className="gal" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
            {photos.map((g, i) => (
              <div className="item" key={g.id}>
                <button type="button" onClick={() => setOpen(g.photo)} aria-label={g.caption || `${t("galleryTitle")} ${i + 1}`}>
                  <Image src={g.photo} alt={g.caption} width={520} height={390} unoptimized={g.photo.startsWith("/api/")} />
                </button>
                {g.caption && <div className="meta">{g.caption}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>
      <Lightbox src={open} onClose={() => setOpen(null)} />
    </>
  );
}
