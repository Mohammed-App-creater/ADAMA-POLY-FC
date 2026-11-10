import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed, Noto_Sans_Ethiopic } from "next/font/google";
import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { LangProvider } from "@/components/client";
import { Footer, Nav } from "@/components/chrome";
import { ScrollFx } from "@/components/fx";
import type { Lang } from "@/lib/i18n";
import "./globals.css";

const body = Barlow({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--f-body" });
const display = Barlow_Condensed({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--f-display" });
const ethiopic = Noto_Sans_Ethiopic({ subsets: ["ethiopic"], weight: ["400", "600", "700"], variable: "--f-eth" });

export const metadata: Metadata = {
  title: { default: "Adama Polytechnic College Football Academy", template: "%s · Adama Poly FC" },
  description: "Youth football academy in Adama: programs from U10 to U17, squads, training schedule, fixtures, registration and fee payment.",
  icons: { icon: "/images/crest.png" },
};
export const viewport: Viewport = { themeColor: "#0d0d0d" };

export default async function RootLayout({ children }: { children: ReactNode }) {
  const saved = (await cookies()).get("lang")?.value;
  const lang: Lang = saved === "am" || saved === "om" ? saved : "en";
  return (
    <html lang={lang} className={`${body.variable} ${display.variable} ${ethiopic.variable}`}>
      <body>
        <LangProvider initial={lang}>
          <a className="skip" href="#main">Skip to content</a>
          <Nav />
          <main id="main">{children}</main>
          <Footer />
          <ScrollFx />
        </LangProvider>
      </body>
    </html>
  );
}
