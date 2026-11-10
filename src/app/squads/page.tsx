"use client";
import { useEffect, useState } from "react";
import { PageHeader, useLang, useSquads } from "@/components/client";
import { GROUPS, POSITIONS, PROGRAMS, type Group } from "@/lib/data";

export default function Squads() {
  const { t } = useLang();
  const { squads } = useSquads();
  const [group, setGroup] = useState<Group>("U10");
  useEffect(() => {
    const g = new URLSearchParams(window.location.search).get("group");
    if (g && (GROUPS as readonly string[]).includes(g)) setGroup(g as Group);
  }, []);
  const list = squads.filter((p) => p.group === group);
  const age = PROGRAMS.find((p) => p.group === group)!.age;

  return (
    <>
      <PageHeader title={t("squadsTitle")} lead={t("squadsLead")} />
      <section>
        <div className="wrap">
          <div className="tabs" role="tablist" aria-label={t("fGroup")}>
            {GROUPS.map((g) => (
              <button key={g} className="tab" role="tab" type="button" aria-selected={g === group} onClick={() => setGroup(g)}>{g}</button>
            ))}
          </div>
          <p className="muted" style={{ marginBottom: 20 }}>{t(age)} · {list.length} {t("playersWord")}</p>
          <div className="pos-grid">
            {POSITIONS.map(({ pos, label }) => {
              const players = list.filter((p) => p.pos === pos);
              return (
                <div className="card pos" key={pos}>
                  <h3>{t(label)} <span>{players.length}</span></h3>
                  <ul className="plist">
                    {players.map((p) => (
                      <li key={p.id} className={p.starter ? "starter" : ""}>
                        <span className="jn">{p.number}</span>
                        <span className="pname">
                          <b>{p.name}</b>
                          {p.foot && <small>{t(p.foot === "R" ? "footR" : "footL")}</small>}
                        </span>
                        {p.added
                          ? <span className="badge b-new">{t("added")}</span>
                          : <span className={`badge ${p.starter ? "b-starter" : "b-backup"}`}>{t(p.starter ? "starter" : "backup")}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
