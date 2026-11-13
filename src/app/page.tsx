"use client";
import Image from "next/image";
import Link from "next/link";
import { CallToAction, FixtureList, KitCards, NewsList, ProgramCards, StoryCards, upcomingOf } from "@/components/blocks";
import { useCollection, useLang, useSquads, type Fixture, type NewsItem, type Story, type TrainingTime } from "@/components/client";
import { Counter, Marquee, RiseText } from "@/components/fx";
import { GROUPS } from "@/lib/data";
import type { Key } from "@/lib/i18n";

const WHY: [Key, Key][] = [["w1t", "w1"], ["w2t", "w2"], ["w3t", "w3"], ["w4t", "w4"]];

export default function Home() {
  const { t } = useLang();
  const { squads } = useSquads();
  const staff = useCollection<{ id: string }>("staff");
  const times = useCollection<TrainingTime>("schedule");
  const sessions = times.rows.reduce((n, s) => n + s.days.split(",").length, 0);
  const fixtures = useCollection<Fixture>("fixtures");
  const news = useCollection<NewsItem>("news");
  const stories = useCollection<Story>("stories");

  return (
    <>
      <header className="hero">
        <div className="hero-bg" aria-hidden="true" />
        <div className="wrap">
          <div>
            <span className="eyebrow">{t("heroEyebrow")}</span>
            <h1><RiseText text={t("heroTitle")} /></h1>
            <p>{t("heroText")}</p>
            <div className="btn-row">
              <Link className="btn" href="/join">{t("btnRegister")}</Link>
              <Link className="btn ghost" href="/programs">{t("btnPrograms")}</Link>
            </div>
          </div>
          <div className="crest-plate">
            <div><Image src="/images/crest.png" alt="College Adama Football Academy crest" width={400} height={400} priority /></div>
          </div>
        </div>
        <span className="scroll-cue" aria-hidden="true" />
      </header>

      <Marquee items={[t("v1t"), t("v2t"), t("v3t"), t("v4t")]} />

      <div className="stats">
        <div className="wrap">
          <div className="stat"><Counter value={squads.length} /><span>{t("statPlayers")}</span></div>
          <div className="stat"><Counter value={GROUPS.length} /><span>{t("statGroups")}</span></div>
          <div className="stat"><Counter value={staff.rows.length} /><span>{t("statCoaches")}</span></div>
          <div className="stat"><Counter value={sessions} /><span>{t("statSessions")}</span></div>
        </div>
      </div>

      <section>
        <div className="wrap two mid">
          <div className="frame reveal">
            <Image src="/images/hero.jpg" alt="" width={1000} height={750} />
          </div>
          <div>
            <div className="sec-head" style={{ marginBottom: 0 }}>
              <div>
                <span className="eyebrow">{t("navAbout")}</span>
                <h2>{t("whyTitle")}</h2>
                <p className="lead">{t("whyLead")}</p>
              </div>
            </div>
            <ul className="ticks">
              {WHY.map(([title, text]) => (
                <li className="reveal" key={title}><b>{t(title)}</b><span>{t(text)}</span></li>
              ))}
            </ul>
            <Link className="btn dark" href="/about">{t("navAbout")} →</Link>
          </div>
        </div>
      </section>

      <section className="alt">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="eyebrow">U10 – U17</span>
              <h2>{t("programsTitle")}</h2>
              <p className="lead">{t("programsLead")}</p>
            </div>
            <Link className="link" href="/programs">{t("viewAll")} →</Link>
          </div>
          <ProgramCards />
        </div>
      </section>

      {stories.rows.length > 0 && (
        <section>
          <div className="wrap">
            <div className="sec-head">
              <div>
                <h2>{t("successTitle")}</h2>
                <p className="lead">{t("successLead")}</p>
              </div>
              <Link className="link" href="/success">{t("viewAll")} →</Link>
            </div>
            <StoryCards rows={stories.rows} limit={3} />
          </div>
        </section>
      )}

      <section className="dark">
        <span className="glow" style={{ left: -160, top: -160 }} aria-hidden="true" />
        <span className="glow" style={{ right: -200, bottom: -240 }} aria-hidden="true" />
        <div className="wrap" style={{ position: "relative" }}>
          <div className="sec-head">
            <div>
              <h2>{t("kitTitle")}</h2>
              <p className="lead">{t("kitLead")}</p>
            </div>
            <Link className="link" href="/kit">{t("sizes")} →</Link>
          </div>
          <KitCards />
        </div>
      </section>

      <section className="alt">
        <div className="wrap two">
          <div>
            <div className="sec-head">
              <h2>{t("upcoming")}</h2>
              <Link className="link" href="/schedule">{t("viewAll")} →</Link>
            </div>
            <FixtureList rows={upcomingOf(fixtures.rows).slice(0, 3)} />
          </div>
          <div>
            <div className="sec-head">
              <h2>{t("latestNews")}</h2>
              <Link className="link" href="/news">{t("viewAll")} →</Link>
            </div>
            <NewsList rows={news.rows} limit={2} />
          </div>
        </div>
      </section>

      <CallToAction />
    </>
  );
}
