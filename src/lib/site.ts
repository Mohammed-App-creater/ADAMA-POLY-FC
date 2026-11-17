// What search engines need to know about the site: its public address and the
// title, description and canonical link of each page.
import type { Metadata } from "next";

export const SITE_NAME = "College Adama Football Academy";

/**
 * Public address of the site, no trailing slash. Set NEXT_PUBLIC_SITE_URL to the
 * real domain; on Vercel the production domain is used when it is not set.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
).replace(/\/+$/, "");

/** Shared by every page's link preview (WhatsApp, Telegram, Facebook). */
export const OG = {
  type: "website" as const, siteName: SITE_NAME, locale: "en_US",
  images: [{ url: "/images/hero.jpg", width: 1000, height: 750, alt: "Players of College Adama Football Academy" }],
};

/** Pages listed in the sitemap, with the text shown for them in search results. */
export const PAGES: Record<string, { title: string; description: string }> = {
  "/about": { title: "About the academy", description: "A football home for boys and girls in Adama, Ethiopia, from under 10 to under 17: our mission, vision and values." },
  "/programs": { title: "Programs", description: "Football training programs for U10, U13, U15 and U17 players in Adama. Every group trains at its own level in small squads." },
  "/squads": { title: "Squads", description: "The College Adama Football Academy squads for every age group, from U10 to U17." },
  "/coaches": { title: "Coaching staff", description: "The coaches and staff who work with the players of College Adama Football Academy every week." },
  "/schedule": { title: "Training schedule and fixtures", description: "Weekly training times for each age group, upcoming matches and results of College Adama Football Academy." },
  "/success": { title: "Success stories", description: "Players from College Adama Football Academy who went on to bigger stages." },
  "/gallery": { title: "Training gallery", description: "Photos from training sessions and match days at College Adama Football Academy in Adama." },
  "/kit": { title: "Team kit", description: "The official College Adama Football Academy kit for training and matches, with a size guide by age." },
  "/news": { title: "News", description: "Announcements and news from College Adama Football Academy." },
  "/join": { title: "Register a player", description: "Register a young player with College Adama Football Academy in Adama. Places are open for under 10 to under 17." },
  "/pay": { title: "Pay fees", description: "How to pay College Adama Football Academy fees and send your payment receipt." },
  "/contact": { title: "Contact", description: "Phone, address and answers to common questions about College Adama Football Academy in Adama, Ethiopia." },
};

/** Metadata for one listed page. Used by the small layout file in each page folder. */
export function pageMeta(path: keyof typeof PAGES & string): Metadata {
  const { title, description } = PAGES[path];
  return {
    title, description,
    alternates: { canonical: path },
    openGraph: { ...OG, title: `${title} · ${SITE_NAME}`, description, url: path },
  };
}

/** For pages that must stay out of search results. */
export const noIndex = (title: string): Metadata => ({
  title, robots: { index: false, follow: false }, alternates: { canonical: null },
});
