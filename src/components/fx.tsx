"use client";
// Motion: scroll-reveal, scroll progress bar, hero parallax, count-up numbers,
// marquee strip. Everything is skipped when the visitor prefers reduced motion.
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";

// Elements that fade and rise into place the first time they scroll into view.
const REVEAL = ".card, .sec-head, .scroll, .gal .item, .steps li, .info li, details.faq, .reveal";

export function ScrollFx() {
  const path = usePathname();
  const [top, setTop] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let io: IntersectionObserver | null = null;
    let mo: MutationObserver | null = null;
    if (!still) {
      root.classList.add("motion");
      io = new IntersectionObserver(
        (entries) => entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("in");
          io!.unobserve(e.target);
        }),
        { rootMargin: "0px 0px -6% 0px" },
      );
      // Track what this run is watching. (A marker on the element itself would
      // survive a re-run of this effect and leave the element hidden for good.)
      const seen = new WeakSet<Element>();
      const scan = () =>
        document.querySelectorAll<HTMLElement>(REVEAL).forEach((el) => {
          if (seen.has(el) || el.classList.contains("in")) return;
          seen.add(el);
          const i = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
          el.style.setProperty("--d", `${Math.min(i, 6) * 80}ms`); // stagger siblings
          io!.observe(el);
        });
      scan();
      mo = new MutationObserver(scan);
      mo.observe(document.body, { childList: true, subtree: true });
    }

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const max = root.scrollHeight - window.innerHeight;
        root.style.setProperty("--p", max > 0 ? String(y / max) : "0");
        if (!still) root.style.setProperty("--sy", String(Math.min(y, 900)));
        root.classList.toggle("scrolled", y > 12);
        setTop(y > 700);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      io?.disconnect();
      mo?.disconnect();
    };
  }, [path]);

  return (
    <>
      <div className="progress" aria-hidden="true" />
      <button
        className={`totop${top ? " show" : ""}`}
        type="button"
        aria-label="Back to top"
        tabIndex={top ? 0 : -1}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >↑</button>
    </>
  );
}

/** Counts up from 0 the first time it is seen. */
export function Counter({ value }: { value: number }) {
  const ref = useRef<HTMLElement>(null);
  const [n, setN] = useState(value);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setN(value);
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const k = Math.min(1, (now - start) / 1400);
        setN(Math.round(value * (1 - Math.pow(1 - k, 3))));
        if (k < 1) raf = requestAnimationFrame(tick);
      };
      setN(0);
      raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [value]);
  return <b ref={ref}>{n}</b>;
}

/** Endless sideways-scrolling strip of words. */
export function Marquee({ items }: { items: string[] }) {
  const run = (hidden: boolean) => (
    <div className="marquee-run" aria-hidden={hidden || undefined}>
      {[...items, ...items].map((x, i) => <span key={i}>{x}</span>)}
    </div>
  );
  return <div className="marquee">{run(false)}{run(true)}</div>;
}

/** Splits a heading into words that rise in one after another. */
export function RiseText({ text }: { text: string }): ReactNode {
  const words = text.split(" ");
  return words.map((w, i) => (
    <Fragment key={i}>
      <span className="word">
        <span style={{ animationDelay: `${120 + i * 90}ms` }} className={i === words.length - 1 ? "hl" : undefined}>{w}</span>
      </span>{" "}
    </Fragment>
  ));
}
