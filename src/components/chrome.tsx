"use client";
// Site header and footer.
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CONTACT } from "@/lib/data";
import { LANGS, type Key, type Lang } from "@/lib/i18n";
import { useLang } from "./client";

const LINKS: { href: string; key: Key; main?: boolean }[] = [
  { href: "/about", key: "navAbout", main: true },
  { href: "/programs", key: "navPrograms", main: true },
  { href: "/squads", key: "navSquads", main: true },
  { href: "/coaches", key: "navCoaches", main: true },
  { href: "/schedule", key: "navSchedule", main: true },
  { href: "/news", key: "navNews", main: true },
  { href: "/gallery", key: "navGallery" },
  { href: "/kit", key: "navKit", main: true },
  { href: "/pay", key: "navPay", main: true },
  { href: "/receipts", key: "navReceipts" },
  { href: "/contact", key: "navContact", main: true },
];

export function Nav() {
  const { t, lang, setLang } = useLang();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);

  return (
    <nav className="nav" aria-label="Main">
      <div className="wrap nav-row">
        <Link className="brand" href="/">
          <Image src="/images/crest.png" alt="" width={44} height={44} priority />
          <span>ADAMA POLY FC</span>
        </Link>
        <ul className={`nav-links${open ? " open" : ""}`} id="nav-links">
          {LINKS.map((l) => (
            <li key={l.href} className={l.main ? "" : "extra"}>
              <Link href={l.href} aria-current={path === l.href ? "page" : undefined}>{t(l.key)}</Link>
            </li>
          ))}
          <li className="nav-cta"><Link className="btn sm" href="/join">{t("navJoin")}</Link></li>
        </ul>
        <div className="nav-tools">
          <select aria-label="Language" value={lang} onChange={(e) => setLang(e.target.value as Lang)}>
            {LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
          <button className="burger" type="button" aria-expanded={open} aria-controls="nav-links" aria-label={t("menu")} onClick={() => setOpen(!open)}>
            <span /><span /><span />
          </button>
        </div>
      </div>
    </nav>
  );
}

export function Footer() {
  const { t } = useLang();
  const col = (keys: [string, Key][]) => keys.map(([href, k]) => <li key={href}><Link href={href}>{t(k)}</Link></li>);
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div>
          <div className="brand">
            <i><Image src="/images/crest.png" alt="" width={58} height={58} /></i>
            <span>ADAMA POLY FC</span>
          </div>
          <p>{t("heroEyebrow")}</p>
        </div>
        <div>
          <h2>{t("quickLinks")}</h2>
          <ul>{col([["/about", "navAbout"], ["/programs", "navPrograms"], ["/squads", "navSquads"], ["/coaches", "navCoaches"], ["/schedule", "navSchedule"], ["/gallery", "navGallery"]])}</ul>
        </div>
        <div>
          <h2>{t("forParents")}</h2>
          <ul>{col([["/join", "navJoin"], ["/pay", "navPay"], ["/receipts", "navReceipts"], ["/kit", "navKit"], ["/news", "navNews"], ["/contact", "navContact"]])}</ul>
        </div>
        <div>
          <h2>{t("navContact")}</h2>
          <ul>
            <li>{CONTACT.phone}</li>
            <li>{CONTACT.email}</li>
            <li>{CONTACT.address}</li>
            <li><Link href="/admin">{t("navStaff")}</Link></li>
          </ul>
        </div>
      </div>
      <div className="wrap footer-base">{t("footer")}</div>
    </footer>
  );
}
