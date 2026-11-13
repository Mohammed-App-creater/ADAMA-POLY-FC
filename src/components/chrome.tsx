"use client";
// Site header and footer.
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LANGS, type Key, type Lang } from "@/lib/i18n";
import { useLang, useSettings } from "./client";

const LINKS: { href: string; key: Key }[] = [
  { href: "/about", key: "navAbout" },
  { href: "/programs", key: "navPrograms" },
  { href: "/squads", key: "navSquads" },
  { href: "/coaches", key: "navCoaches" },
  { href: "/schedule", key: "navSchedule" },
  { href: "/news", key: "navNews" },
  { href: "/gallery", key: "navGallery" },
  { href: "/kit", key: "navKit" },
  { href: "/pay", key: "navPay" },
  { href: "/receipts", key: "navReceipts" },
  { href: "/contact", key: "navContact" },
];

/** Language switcher drawn in the site's own style (not the browser's dropdown). */
function LangMenu({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", away); document.removeEventListener("keydown", esc); };
  }, [open]);
  return (
    <div className="langmenu" ref={ref}>
      <button type="button" aria-haspopup="listbox" aria-expanded={open} aria-label="Language" onClick={() => setOpen(!open)}>
        {LANGS.find((l) => l.code === lang)?.label}
        <svg viewBox="0 0 12 8" aria-hidden="true"><path d="M1 1.5l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {open && (
        <ul role="listbox" aria-label="Language">
          {LANGS.map((l) => (
            <li key={l.code} role="presentation">
              <button type="button" role="option" aria-selected={l.code === lang} onClick={() => { setLang(l.code); setOpen(false); }}>{l.label}</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Nav() {
  const { t, lang, setLang } = useLang();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  if (path.startsWith("/admin")) return null;

  return (
    <nav className="nav" aria-label="Main">
      <div className="wrap nav-row">
        <Link className="brand" href="/">
          <Image src="/images/crest.png" alt="" width={44} height={44} priority />
          <span>COLLEGE ADAMA FC</span>
        </Link>
        <ul className={`nav-links${open ? " open" : ""}`} id="nav-links">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} aria-current={path === l.href ? "page" : undefined}>{t(l.key)}</Link>
            </li>
          ))}
          <li className="nav-cta"><Link className="btn sm" href="/join">{t("navJoin")}</Link></li>
        </ul>
        <div className="nav-tools">
          <LangMenu lang={lang} setLang={setLang} />
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
  const { settings } = useSettings();
  const path = usePathname();
  if (path.startsWith("/admin")) return null;
  const col = (keys: [string, Key][]) => keys.map(([href, k]) => <li key={href}><Link href={href}>{t(k)}</Link></li>);
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div>
          <div className="brand">
            <i><Image src="/images/crest.png" alt="" width={58} height={58} /></i>
            <span>COLLEGE ADAMA FC</span>
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
            <li>{settings.phone}</li>
            <li>{settings.email}</li>
            <li>{settings.address}</li>
            <li><Link href="/admin">{t("navStaff")}</Link></li>
          </ul>
        </div>
      </div>
      <div className="wrap footer-base">{t("footer")}</div>
    </footer>
  );
}
