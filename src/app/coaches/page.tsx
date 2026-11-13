"use client";
import Image from "next/image";
import { PageHeader, roleLabel, useCollection, useLang } from "@/components/client";
import type { StaffMember } from "@/lib/data";

export default function Coaches() {
  const { t } = useLang();
  const list = useCollection<StaffMember>("staff").rows;
  return (
    <>
      <PageHeader title={t("coachTitle")} lead={t("coachLead")} />
      <section>
        <div className="wrap">
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))" }}>
            {list.map((s, i) => (
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
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
