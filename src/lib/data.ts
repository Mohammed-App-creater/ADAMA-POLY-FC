// Starter content. Contact details, the timetable, coaches, squads and gallery
// are copied from here into the database the first time the site runs; after
// that staff edit them from the admin and changes to this file have no effect.
import type { Key } from "./i18n";

export const GROUPS = ["U10", "U13", "U15", "U17"] as const;
export const ALL_GROUPS = [...GROUPS, "Senior"] as const;
export type Group = (typeof GROUPS)[number];

// Starting contact details. Staff change them under Admin > Settings.
export const OLD_ADDRESS = "Adama Polytechnic College sports ground, Adama"; // from before the name was corrected
export const OLD_PHONE = "+251 ___ ___ ___"; // placeholder used before the real number was known
export const CONTACT = {
  phone: "+251 91 341 2418",
  email: "info@adamapoly.example",
  address: "College Adama sports ground, Adama",
  bankAccount: "1000432933834 (College Adama Football Academy)", // shown on the Pay page
};

export const SCHEDULE: { group: Group; days: string; time: string }[] = [
  { group: "U10", days: "Tue, Thu", time: "4:00 – 5:00 PM" },
  { group: "U13", days: "Mon, Wed, Fri", time: "4:30 – 6:00 PM" },
  { group: "U15", days: "Mon, Wed, Fri", time: "5:00 – 6:30 PM" },
  { group: "U17", days: "Tue, Thu, Sat", time: "5:00 – 7:00 PM" },
];

export const PROGRAMS: { group: Group; age: Key; text: Key }[] = [
  { group: "U10", age: "u10age", text: "u10" },
  { group: "U13", age: "u13age", text: "u13" },
  { group: "U15", age: "u15age", text: "u15" },
  { group: "U17", age: "u17age", text: "u17" },
];

export type StaffMember = { id?: string; name: string; role: string; phone?: string; jersey?: string; photo?: string };
export const STAFF: StaffMember[] = [
  { name: "Biruk Almyhu", role: "r_head", photo: "/images/coach-head.jpg" },
  { name: "Biruk", role: "r_second" },
  { name: "Engeda", role: "r_coach" },
];
export const ROLE_KEYS: Key[] = ["r_head", "r_asst", "r_gk", "r_fit", "r_doc", "r_mgr"];

// Kit colours. Home is the players' kit as supplied by the maker: black chest and
// sleeves with gold brush strokes, gold body with a diagonal dash print, black
// shorts with gold side panels and plain black socks. Away and Training are the
// same cut in other crest colourways.
// `number` is printed on the body; `text` on the chest panel and shorts, which
// therefore have to share a tone.
export type KitDesign = {
  name: Key; body: string; print: string; yoke: string; trim: string; shorts: string; shortsTrim: string;
  socks: string; number: string; text: string;
};
export const KITS: KitDesign[] = [
  { name: "kitHome", body: "#f4b223", print: "#d2921a", yoke: "#141414", trim: "#f4b223", shorts: "#141414", shortsTrim: "#f4b223", socks: "#141414", number: "#ffffff", text: "#ffffff" },
  { name: "kitAway", body: "#171717", print: "#2c2c2c", yoke: "#f4b223", trim: "#141414", shorts: "#f4b223", shortsTrim: "#141414", socks: "#f4b223", number: "#ffffff", text: "#141414" },
  { name: "kitTraining", body: "#f7f7f4", print: "#e2e1da", yoke: "#141414", trim: "#f4b223", shorts: "#141414", shortsTrim: "#f4b223", socks: "#141414", number: "#141414", text: "#ffffff" },
];
export const SIZES = [["XS", "8–10"], ["S", "11–12"], ["M", "13–14"], ["L", "15–17"], ["XL", "18+"]];

export const GALLERY = ["/images/training-1.jpg", "/images/training-2.jpg", "/images/training-3.jpg", "/images/hero.jpg"];

// Sample rosters: 2 goalkeepers, 6 defenders, 6 midfielders, 6 forwards per group.
const NAMES: Record<Group, string[]> = {
  U10: ["Abel Tesfaye", "Biniam Girma", "Dawit Haile", "Elias Mekonnen", "Fikru Assefa", "Henok Berhanu", "Kaleab Solomon", "Natnael Tadesse", "Robel Negash", "Samuel Worku", "Yonas Getachew", "Yared Bekele", "Ephrem Lemma", "Bereket Alemu", "Mikiyas Abebe", "Nahom Demissie", "Kebede Tesfaye", "Dagmawi Wondimu", "Surafel Shiferaw", "Lidetu Fekadu"],
  U13: ["Amanuel Tesfa", "Abenezer Mulugeta", "Biruk Hailemariam", "Daniel Kassa", "Eyob Tilahun", "Gashaw Teshome", "Hamza Ahmed", "Ibrahim Seid", "Kidus Abera", "Michael Dereje", "Nathnael Alemayehu", "Olyad Bayissa", "Rediet Tamiru", "Simon Teklu", "Temesgen Ayele", "Wondwossen Gebre", "Yosef Mengistu", "Zerihun Haile", "Addisu Bogale", "Dagim Asfaw"],
  U15: ["Abdi Hassen", "Adane Gizaw", "Bisrat Kidane", "Chala Feyisa", "Dejene Tadesse", "Ermias Getu", "Fasil Yohannes", "Gebru Assefa", "Habtamu Ketema", "Iyasu Abraham", "Jemal Ahmed", "Kibrom Mesfin", "Liyu Desta", "Mesfin Zewdu", "Mulugeta Terefe", "Nebiyu Hunde", "Oumer Kedir", "Petros Lemi", "Ramzi Hussein", "Sisay Dagne"],
  U17: ["Abiy Mesele", "Adem Ibrahim", "Amare Woldu", "Chernet Tsegaye", "Dereje Mamo", "Eskinder Tekle", "Fitihu Gedi", "Getachew Ayana", "Haftom Asrat", "Ibsa Negussie", "Jabir Seid", "Kassahun Fikadu", "Lencho Tufa", "Mathias Wolde", "Nigussie Bekele", "Oljira Bayu", "Pawlos Shimelis", "Sintayehu Ketema", "Tekle Haymanot", "Wubshet Lakew"],
};

export type Pos = "GK" | "DEF" | "MID" | "FWD";
export const POSITIONS: { pos: Pos; label: Key }[] = [
  { pos: "GK", label: "posGK" }, { pos: "DEF", label: "posDEF" }, { pos: "MID", label: "posMID" }, { pos: "FWD", label: "posFWD" },
];
const posOf = (i: number): Pos => (i < 2 ? "GK" : i < 8 ? "DEF" : i < 14 ? "MID" : "FWD");

export type SquadPlayer = {
  id: string; name: string; group: string; pos: Pos; number: string;
  starter?: boolean; foot?: "R" | "L"; photo?: string;
};

export function baseSquad(group: Group): SquadPlayer[] {
  return NAMES[group].map((name, i) => ({
    id: `sq-${group}-${i + 1}`, name, group, pos: posOf(i), number: String(i + 1),
    starter: i === 0 || i === 2 || i === 8 || i === 14, foot: i % 2 === 0 ? "R" : "L",
  }));
}
