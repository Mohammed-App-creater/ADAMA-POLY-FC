"use client";
import Image from "next/image";
import { useState } from "react";
import { Lightbox, PageHeader, useLang } from "@/components/client";
import { GALLERY } from "@/lib/data";

export default function Gallery() {
  const { t } = useLang();
  const [open, setOpen] = useState<string | null>(null);
  return (
    <>
      <PageHeader title={t("galleryTitle")} lead={t("galleryLead")} />
      <section>
        <div className="wrap">
          <div className="gal" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
            {GALLERY.map((src, i) => (
              <div className="item" key={src}>
                <button type="button" onClick={() => setOpen(src)} aria-label={`${t("galleryTitle")} ${i + 1}`}>
                  <Image src={src} alt="" width={520} height={390} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Lightbox src={open} onClose={() => setOpen(null)} />
    </>
  );
}
