"use client";
import Image from "next/image";
import { useState } from "react";
import { Lightbox, PageHeader, roleLabel, useCollection, useLang, type GalleryPhoto } from "@/components/client";
import type { StaffMember } from "@/lib/data";

export default function Coaches() {
  const { t } = useLang();
  const list = useCollection<StaffMember>("staff").rows;
  const photos = useCollection<GalleryPhoto>("gallery").rows;
  const [open, setOpen] = useState<string | null>(null);
  return (
    <>
      <PageHeader title={t("coachTitle")} lead={t("coachLead")} />
      <section>
        <div className="wrap">
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))" }}>
            {list.map((s, i) => {
              const mine = photos.filter((g) => g.coach && g.coach === s.id);
              return (
              <article className="card person" key={s.id ?? i}>
                <div className="photo">
                  {s.photo
                    ? <Image src={s.photo} alt={s.name} width={600} height={450} unoptimized={s.photo.startsWith("/api/")} />
                    : <span aria-hidden="true">{s.name.charAt(0)}</span>}
                </div>
                <div className="body">
                  <h3>{s.name}</h3>
                  <div className="tagline">{roleLabel(t, s.role)}{s.jersey ? ` · #${s.jersey}` : ""}</div>
                  {s.phone && <p>{s.phone}</p>}
                  {mine.length > 0 && (
                    <div className="thumbs">
                      {mine.map((g) => (
                        <button key={g.id} type="button" onClick={() => setOpen(g.photo)} aria-label={g.caption || `${s.name} photo`}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={g.photo} alt={g.caption} loading="lazy" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </article>
              );
            })}
          </div>
        </div>
      </section>
      <Lightbox src={open} onClose={() => setOpen(null)} />
    </>
  );
}
