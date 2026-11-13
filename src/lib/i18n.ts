// All visible text in three languages. A key missing from am/om falls back to English.
export type Lang = "en" | "am" | "om";
export const LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "am", label: "አማርኛ" },
  { code: "om", label: "Afaan Oromoo" },
];

const en = {
  navHome: "Home", navAbout: "About", navPrograms: "Programs", navSquads: "Squads", navCoaches: "Coaches",
  navSchedule: "Schedule", navGallery: "Gallery", navKit: "Kit", navNews: "News", navPay: "Pay fees",
  navReceipts: "Receipts", navContact: "Contact", navJoin: "Join", navStaff: "Staff", menu: "Menu",

  heroEyebrow: "College Adama Football Academy",
  heroTitle: "Where champions are made",
  heroText: "College Adama Football Academy trains young players in technique, fitness and character, from their first touch to match-day confidence.",
  btnRegister: "Register a player", btnPrograms: "See programs",
  statPlayers: "Squad players", statGroups: "Age groups", statCoaches: "Coaches", statSessions: "Sessions a week",

  programsTitle: "Programs",
  programsLead: "Every group trains at its own level, with small squads so each player gets attention.",
  u10age: "Under 10", u13age: "Under 13", u15age: "Under 15", u17age: "Under 17",
  u10: "Ball control, coordination and play-based games that build love for the sport.",
  u13: "Passing, positioning, small-sided matches and the basics of teamwork.",
  u15: "Tactics, strength and speed work, and regular fixtures against other academies.",
  u17: "Advanced match play and fitness for players preparing for club trials and tournaments.",
  trainsOn: "Trains", viewSquad: "View squad",

  coachTitle: "Coaching staff", coachLead: "The coaches and staff who work with our players every week.",
  schedTitle: "Training schedule", schedLead: "Sample timetable. Final times are confirmed at registration.",
  thGroup: "Group", thDays: "Days", thTime: "Time",
  fixTitle: "Fixtures and results", fixLead: "Matches for every age group.",
  upcoming: "Upcoming matches", results: "Results", home: "Home", away: "Away", vs: "vs",
  noFixtures: "No matches listed yet.",

  kitTitle: "Team kit", kitLead: "Official academy kit for training and matches.", sizes: "Size guide",
  kitHome: "Home", kitAway: "Away", kitTraining: "Training", thSize: "Size", thAge: "Age",

  whyTitle: "Why College Adama FC",
  whyLead: "We develop the whole player: skill on the pitch, discipline in training and respect off it.",
  w1t: "Qualified coaches", w1: "Training plans that match each age group.",
  w2t: "Match experience", w2: "Friendly games and tournaments through the season.",
  w3t: "Progress tracking", w3: "Parents get regular updates on their player's growth.",
  w4t: "Character first", w4: "Teamwork, discipline and fair play in every session.",

  aboutTitle: "About the academy",
  aboutLead: "A football home for young players in Adama, run from the Adama Polytechnic College sports ground.",
  aboutText: "The academy gives boys and girls from under 10 to under 17 a safe, organised place to learn the game. Players train in small groups with qualified coaches, play regular matches and are expected to do well in school as well as on the pitch.",
  missionT: "Our mission", mission: "To develop skilled, disciplined and confident young footballers, and to help every player reach their best level.",
  visionT: "Our vision", vision: "To be the leading youth football academy in Adama and a trusted path to clubs and national youth teams.",
  valuesT: "Our values",
  v1t: "Discipline", v1: "Arrive on time, listen and give full effort in every session.",
  v2t: "Teamwork", v2: "We win, lose and improve together.",
  v3t: "Respect", v3: "For teammates, opponents, referees and coaches.",
  v4t: "Education", v4: "School comes first. Football and study go together.",

  galleryTitle: "Training gallery", galleryLead: "Moments from our training sessions.",
  newsTitle: "News", newsLead: "Announcements from the academy.", noNews: "No news yet.",
  latestNews: "Latest news", viewAll: "View all",

  payTitle: "Pay monthly fee",
  payLead: "Pay through Commercial Bank of Ethiopia (CBE), then upload the receipt photo here. Each payment is checked by the cashier.",
  payNote: "Register the player first if they are not in the list.",
  step1: "Pay at CBE", step1d: "Pay the monthly fee at a branch or with CBE mobile banking.",
  step2: "Take a photo", step2d: "Photograph the receipt or take a screenshot.",
  step3: "Upload it here", step3d: "The cashier checks it and marks it verified.",
  bankAccount: "CBE account",
  fPlayer: "Player", fReceipt: "Receipt photo", btnPay: "Submit payment", choose: "Choose player",
  recTitle: "Receipts by player", recLead: "Every payment receipt, shown as a picture.",
  noReceipts: "No receipts yet.", all: "All", pending: "Pending", verified: "Verified", rejected: "Rejected",

  joinTitle: "Join the academy",
  joinLead: "Send the player's details and we will contact you with trial dates and fees.",
  fName: "Player name", fAge: "Age", fGroup: "Age group", fStudentId: "Student ID", fParent: "Parent name",
  fPhone: "Phone", btnSend: "Send registration",
  joinNext: "What happens next",
  jn1: "We call the parent to confirm the details.", jn2: "The player attends a trial session.",
  jn3: "You pay the first monthly fee and training begins.",

  contactTitle: "Contact us", contactLead: "Questions about registration, fees or training? Send us a message.",
  cPhone: "Phone", cEmail: "Email", cAddress: "Address", cHours: "Office hours", hoursText: "Monday to Saturday, 2:00 – 7:00 PM",
  fYourName: "Your name", fEmail: "Email (optional)", fMessage: "Message", btnSendMsg: "Send message",
  savedMsg: "Thank you. We received your message.",
  faqTitle: "Common questions",
  q1: "Who can join?", a1: "Any player aged 8 to 17. Each player joins the group for their age.",
  q2: "How do I pay?", a2: "Pay the monthly fee at CBE and upload the receipt photo on the Pay fees page.",
  q3: "What should players bring?", a3: "Football boots, shin guards, water and the academy training kit.",
  q4: "Is there a trial?", a4: "Yes. New players attend one trial session before joining a squad.",

  ctaTitle: "Ready to play?", ctaText: "Register today and join the next trial session.",

  errReq: "Please fill all fields and attach a receipt photo.", errFields: "Please fill all required fields.",
  errSave: "Could not save. Please try again.",
  savedReg: "Thank you. We received the registration and will call you soon.",
  savedPay: "Payment submitted. Status: pending.", sending: "Sending…", loading: "Loading…",

  posGK: "Goalkeepers", posDEF: "Defenders", posMID: "Midfielders", posFWD: "Forwards",
  starter: "Starter", backup: "Backup", added: "New", footR: "Right foot", footL: "Left foot",
  squadsTitle: "Player squads",
  squadsLead: "Twenty players in each age group. Names are sample entries until the real rosters are confirmed.",
  playersWord: "players",

  r_head: "Head Coach", r_asst: "Assistant Coach", r_gk: "Goalkeeping Coach", r_fit: "Fitness Coach",
  r_doc: "Team Doctor", r_mgr: "Team Manager", r_second: "Second Coach", r_coach: "Coach",

  notFoundTitle: "Page not found", notFoundText: "The page you are looking for does not exist.", backHome: "Back to home",
  quickLinks: "Quick links", forParents: "For parents",
  footer: "© 2026 College Adama Football Academy",
};

export type Key = keyof typeof en;

const am: Partial<Record<Key, string>> = {
  navHome: "መነሻ", navAbout: "ስለ እኛ", navPrograms: "ፕሮግራሞች", navSquads: "ቡድኖች", navCoaches: "አሰልጣኞች",
  navSchedule: "የጊዜ ሰሌዳ", navGallery: "ምስሎች", navKit: "ልብስ", navNews: "ዜና", navPay: "ክፍያ",
  navReceipts: "ደረሰኞች", navContact: "ያግኙን", navJoin: "ይቀላቀሉ", navStaff: "ሰራተኞች", menu: "ማውጫ",

  heroEyebrow: "ኮሌጅ አዳማ የእግር ኳስ አካዳሚ",
  heroTitle: "ሻምፒዮኖች የሚፈጠሩበት",
  heroText: "ኮሌጅ አዳማ የእግር ኳስ አካዳሚ ወጣት ተጫዋቾችን ከመጀመሪያው ንክኪ እስከ የጨዋታ ቀን በራስ መተማመን ድረስ በቴክኒክ፣ በአካል ብቃት እና በባህሪ ያሰለጥናል።",
  btnRegister: "ተጫዋች ያስመዝግቡ", btnPrograms: "ፕሮግራሞችን ይመልከቱ",
  statPlayers: "ተጫዋቾች", statGroups: "የእድሜ ምድቦች", statCoaches: "አሰልጣኞች", statSessions: "ስልጠና በሳምንት",

  programsTitle: "ፕሮግራሞች",
  programsLead: "እያንዳንዱ ቡድን በራሱ ደረጃ ይሰለጥናል፤ ቡድኖቹ ትንሽ በመሆናቸው እያንዳንዱ ተጫዋች ትኩረት ያገኛል።",
  u10age: "ከ10 ዓመት በታች", u13age: "ከ13 ዓመት በታች", u15age: "ከ15 ዓመት በታች", u17age: "ከ17 ዓመት በታች",
  u10: "ኳስ መቆጣጠር፣ ቅንጅት እና ለስፖርቱ ፍቅር የሚያዳብሩ በጨዋታ ላይ የተመሰረቱ ልምምዶች።",
  u13: "ኳስ ማቀበል፣ ቦታ አያያዝ፣ ትናንሽ ጨዋታዎች እና የቡድን ስራ መሰረታዊ ነገሮች።",
  u15: "ታክቲክ፣ የጥንካሬ እና የፍጥነት ልምምድ፣ እንዲሁም ከሌሎች አካዳሚዎች ጋር መደበኛ ጨዋታዎች።",
  u17: "ለክለብ ሙከራዎች እና ውድድሮች ለሚዘጋጁ ተጫዋቾች ከፍተኛ የጨዋታ ልምድ እና የአካል ብቃት።",
  trainsOn: "የስልጠና ቀናት", viewSquad: "ቡድኑን ይመልከቱ",

  coachTitle: "አሰልጣኞቻችን", coachLead: "በየሳምንቱ ከተጫዋቾቻችን ጋር የሚሰሩ አሰልጣኞችና ሰራተኞች።",
  schedTitle: "የስልጠና ፕሮግራም", schedLead: "ናሙና የጊዜ ሰሌዳ። የመጨረሻ ሰዓቶች በምዝገባ ወቅት ይረጋገጣሉ።",
  thGroup: "ቡድን", thDays: "ቀናት", thTime: "ሰዓት",
  fixTitle: "ጨዋታዎች እና ውጤቶች", fixLead: "የሁሉም የእድሜ ምድቦች ጨዋታዎች።",
  upcoming: "ቀጣይ ጨዋታዎች", results: "ውጤቶች", home: "በሜዳችን", away: "ከሜዳ ውጪ", vs: "ከ",
  noFixtures: "ገና የተመዘገበ ጨዋታ የለም።",

  kitTitle: "የቡድን ልብስ", kitLead: "ለልምምድና ለጨዋታ የአካዳሚው ኦፊሴላዊ ልብስ።", sizes: "የመጠን መመሪያ",
  kitHome: "የሜዳ", kitAway: "የውጪ", kitTraining: "የልምምድ", thSize: "መጠን", thAge: "እድሜ",

  whyTitle: "ለምን ኮሌጅ አዳማ FC",
  whyLead: "ተጫዋቹን በሁለንተናዊ መልኩ እናሳድጋለን፦ በሜዳ ላይ ክህሎት፣ በስልጠና ወቅት ዲሲፕሊን እና ከሜዳ ውጪ ክብር።",
  w1t: "ብቁ አሰልጣኞች", w1: "ለእያንዳንዱ የእድሜ ቡድን የሚመጥኑ የስልጠና እቅዶች።",
  w2t: "የጨዋታ ልምድ", w2: "በውድድር ዘመኑ ወዳጃዊ ጨዋታዎች እና ውድድሮች።",
  w3t: "እድገት መከታተል", w3: "ወላጆች ስለ ልጃቸው እድገት መደበኛ መረጃ ያገኛሉ።",
  w4t: "መጀመሪያ ባህሪ", w4: "በእያንዳንዱ ስልጠና የቡድን ስራ፣ ዲሲፕሊን እና ፍትሃዊ ጨዋታ።",

  aboutTitle: "ስለ አካዳሚው",
  aboutLead: "በአዳማ ፖሊቴክኒክ ኮሌጅ የስፖርት ሜዳ የሚካሄድ የወጣት ተጫዋቾች የእግር ኳስ ቤት።",
  aboutText: "አካዳሚው ከ10 ዓመት በታች እስከ 17 ዓመት በታች ላሉ ልጆች እግር ኳስን የሚማሩበት ደህንነቱ የተጠበቀና የተደራጀ ቦታ ይሰጣል። ተጫዋቾች በትናንሽ ቡድኖች ከብቁ አሰልጣኞች ጋር ይሰለጥናሉ፣ መደበኛ ጨዋታዎችን ያደርጋሉ፣ በትምህርታቸውም ጎበዝ እንዲሆኑ ይጠበቃል።",
  missionT: "ተልዕኳችን", mission: "ክህሎት፣ ዲሲፕሊን እና በራስ መተማመን ያላቸው ወጣት ተጫዋቾችን ማፍራት፤ እያንዳንዱ ተጫዋች የተሻለ ደረጃው ላይ እንዲደርስ መርዳት።",
  visionT: "ራዕያችን", vision: "በአዳማ ቀዳሚ የወጣቶች የእግር ኳስ አካዳሚ መሆን እና ወደ ክለቦችና ብሔራዊ የወጣት ቡድኖች የሚያደርስ ታማኝ መንገድ መሆን።",
  valuesT: "እሴቶቻችን",
  v1t: "ዲሲፕሊን", v1: "በሰዓቱ መገኘት፣ ማዳመጥ እና በእያንዳንዱ ስልጠና ሙሉ ጥረት ማድረግ።",
  v2t: "የቡድን ስራ", v2: "አብረን እናሸንፋለን፣ እንሸነፋለን፣ እንሻሻላለን።",
  v3t: "ክብር", v3: "ለቡድን አጋሮች፣ ለተጋጣሚዎች፣ ለዳኞች እና ለአሰልጣኞች።",
  v4t: "ትምህርት", v4: "ትምህርት ይቀድማል። እግር ኳስና ትምህርት አብረው ይሄዳሉ።",

  galleryTitle: "የስልጠና ምስሎች", galleryLead: "ከስልጠና ጊዜያቶቻችን የተወሰዱ ምስሎች።",
  newsTitle: "ዜና", newsLead: "ከአካዳሚው የሚወጡ ማስታወቂያዎች።", noNews: "ገና ዜና የለም።",
  latestNews: "የቅርብ ዜና", viewAll: "ሁሉንም ይመልከቱ",

  payTitle: "ወርሃዊ ክፍያ",
  payLead: "በኢትዮጵያ ንግድ ባንክ (CBE) ይክፈሉ፣ ከዚያም የደረሰኝ ፎቶ እዚህ ይላኩ። እያንዳንዱ ክፍያ በገንዘብ ያዡ ይረጋገጣል።",
  payNote: "ተጫዋቹ በዝርዝሩ ውስጥ ከሌለ መጀመሪያ ያስመዝግቡ።",
  step1: "በCBE ይክፈሉ", step1d: "ወርሃዊ ክፍያውን በቅርንጫፍ ወይም በCBE ሞባይል ባንኪንግ ይክፈሉ።",
  step2: "ፎቶ ያንሱ", step2d: "ደረሰኙን ፎቶ ያንሱ ወይም ስክሪንሾት ይውሰዱ።",
  step3: "እዚህ ይላኩ", step3d: "ገንዘብ ያዡ አይቶ ያረጋግጣል።",
  bankAccount: "የCBE ሂሳብ",
  fPlayer: "ተጫዋች", fReceipt: "የደረሰኝ ፎቶ", btnPay: "ክፍያ ላክ", choose: "ተጫዋች ይምረጡ",
  recTitle: "በተጫዋች ደረሰኞች", recLead: "እያንዳንዱ የክፍያ ደረሰኝ በፎቶ ይታያል።",
  noReceipts: "ገና ደረሰኝ የለም።", all: "ሁሉም", pending: "በመጠባበቅ", verified: "ተረጋግጧል", rejected: "ውድቅ",

  joinTitle: "አካዳሚውን ይቀላቀሉ",
  joinLead: "የተጫዋቹን ዝርዝር ይላኩ፤ የሙከራ ቀናትን እና ክፍያዎችን ይዘን እንደውላለን።",
  fName: "የተጫዋች ስም", fAge: "እድሜ", fGroup: "የእድሜ ምድብ", fStudentId: "የተማሪ መለያ ቁጥር", fParent: "የወላጅ ስም",
  fPhone: "ስልክ", btnSend: "ምዝገባ ላክ",
  joinNext: "ቀጥሎ የሚሆነው",
  jn1: "ዝርዝሩን ለማረጋገጥ ለወላጅ እንደውላለን።", jn2: "ተጫዋቹ በሙከራ ስልጠና ላይ ይገኛል።",
  jn3: "የመጀመሪያውን ወርሃዊ ክፍያ ይከፍላሉ፤ ስልጠናም ይጀምራል።",

  contactTitle: "ያግኙን", contactLead: "ስለ ምዝገባ፣ ክፍያ ወይም ስልጠና ጥያቄ አለዎት? መልዕክት ይላኩልን።",
  cPhone: "ስልክ", cEmail: "ኢሜይል", cAddress: "አድራሻ", cHours: "የስራ ሰዓት", hoursText: "ከሰኞ እስከ ቅዳሜ፣ ከቀኑ 8:00 – ምሽቱ 1:00",
  fYourName: "ስምዎ", fEmail: "ኢሜይል (አማራጭ)", fMessage: "መልዕክት", btnSendMsg: "መልዕክት ላክ",
  savedMsg: "እናመሰግናለን። መልዕክትዎን ተቀብለናል።",
  faqTitle: "ተደጋጋሚ ጥያቄዎች",
  q1: "ማን መቀላቀል ይችላል?", a1: "ከ8 እስከ 17 ዓመት ያለ ማንኛውም ተጫዋች። እያንዳንዱ ተጫዋች በእድሜው ምድብ ይገባል።",
  q2: "እንዴት እከፍላለሁ?", a2: "ወርሃዊ ክፍያውን በCBE ከፍለው የደረሰኙን ፎቶ በክፍያ ገጽ ላይ ይላኩ።",
  q3: "ተጫዋቾች ምን ይዘው ይምጡ?", a3: "የእግር ኳስ ጫማ፣ የቅልጥም መከላከያ፣ ውሃ እና የአካዳሚው የልምምድ ልብስ።",
  q4: "ሙከራ አለ?", a4: "አዎ። አዲስ ተጫዋቾች ቡድን ከመቀላቀላቸው በፊት አንድ የሙከራ ስልጠና ይካፈላሉ።",

  ctaTitle: "ለመጫወት ዝግጁ ነዎት?", ctaText: "ዛሬ ይመዝገቡ፤ በቀጣዩ የሙከራ ስልጠና ላይ ይገኙ።",

  errReq: "እባክዎ ሁሉንም ሜዳዎች ይሙሉ እና የደረሰኝ ፎቶ ያያይዙ።", errFields: "እባክዎ ሁሉንም አስፈላጊ ሜዳዎች ይሙሉ።",
  errSave: "ማስቀመጥ አልተቻለም። እባክዎ እንደገና ይሞክሩ።",
  savedReg: "እናመሰግናለን። ምዝገባውን ተቀብለናል፤ በቅርቡ እንደውላለን።",
  savedPay: "ክፍያ ተልኳል። ሁኔታ፡ በመጠባበቅ።", sending: "በመላክ ላይ…", loading: "በመጫን ላይ…",

  posGK: "ግብ ጠባቂዎች", posDEF: "ተከላካዮች", posMID: "አማካዮች", posFWD: "አጥቂዎች",
  starter: "ዋና", backup: "ተተኪ", added: "አዲስ", footR: "ቀኝ እግር", footL: "ግራ እግር",
  squadsTitle: "የተጫዋቾች ቡድኖች",
  squadsLead: "በእያንዳንዱ የእድሜ ምድብ ሃያ ተጫዋቾች። የመጨረሻ ዝርዝሮች እስከሚረጋገጡ ድረስ ስሞቹ ናሙና ናቸው።",
  playersWord: "ተጫዋቾች",

  r_head: "ዋና አሰልጣኝ", r_asst: "ረዳት አሰልጣኝ", r_gk: "የግብ ጠባቂ አሰልጣኝ", r_fit: "የአካል ብቃት አሰልጣኝ",
  r_doc: "የቡድን ሀኪም", r_mgr: "የቡድን አስተዳዳሪ", r_second: "ሁለተኛ አሰልጣኝ", r_coach: "አሰልጣኝ",

  notFoundTitle: "ገጹ አልተገኘም", notFoundText: "የሚፈልጉት ገጽ የለም።", backHome: "ወደ መነሻ ተመለስ",
  quickLinks: "ፈጣን ማገናኛዎች", forParents: "ለወላጆች",
  footer: "© 2026 ኮሌጅ አዳማ የእግር ኳስ አካዳሚ",
};

const om: Partial<Record<Key, string>> = {
  navHome: "Jalqaba", navAbout: "Waa'ee keenya", navPrograms: "Sagantaalee", navSquads: "Garee", navCoaches: "Leenjistoota",
  navSchedule: "Sagantaa", navGallery: "Suuraalee", navKit: "Uffata", navNews: "Oduu", navPay: "Kaffaltii",
  navReceipts: "Cuunfaa", navContact: "Nu quunnamaa", navJoin: "Makami", navStaff: "Hojjettoota", menu: "Baafata",

  heroEyebrow: "Akaadaamii Kubbaa Miilaa Kolleejjii Adaamaa",
  heroTitle: "Iddoo shaampiyoononni itti uumaman",
  heroText: "Akaadaamiin Kubbaa Miilaa Kolleejjii Adaamaa taphattoota dargaggoo teekiniikii, gabbina qaamaa fi amala irratti leenjisa, tuqaa jalqabaa irraa hanga amantaa guyyaa taphaatti.",
  btnRegister: "Taphataa galmeessi", btnPrograms: "Sagantaalee ilaali",
  statPlayers: "Taphattoota", statGroups: "Garee umurii", statCoaches: "Leenjistoota", statSessions: "Leenjii torbanitti",

  programsTitle: "Sagantaalee",
  programsLead: "Gareen hundi sadarkaa isaa irratti leenjifama; gareewwan xixiqqoo waan ta'aniif taphataan hundi xiyyeeffannoo argata.",
  u10age: "Waggaa 10 gadi", u13age: "Waggaa 13 gadi", u15age: "Waggaa 15 gadi", u17age: "Waggaa 17 gadi",
  u10: "Kubbaa to'achuu, wal-qixxeessuu fi taphoota jaalala ispoortii guddisan.",
  u13: "Kubbaa wal-kennuu, bakka qabachuu, taphoota xixiqqoo fi bu'uura hojii gareetii.",
  u15: "Taakitiksii, leenjii cimina fi saffisaa, akkasumas taphoota idilee akaadaamiiwwan biroo wajjin.",
  u17: "Muuxannoo taphaa olaanaa fi gabbina qaamaa taphattoota qormaata kilaboo fi dorgommii irra jiraniif.",
  trainsOn: "Guyyoota leenjii", viewSquad: "Garee ilaali",

  coachTitle: "Leenjistoota Keenya",
  schedTitle: "Sagantaa Leenjii", schedLead: "Fakkeenya sagantaa. Sa'aatiin xumuraa yeroo galmeessisanitti mirkanaa'a.",
  thGroup: "Garee", thDays: "Guyyoota", thTime: "Sa'aatii",
  fixTitle: "Taphoota fi bu'aa", upcoming: "Taphoota dhufan", results: "Bu'aa", home: "Mana", away: "Ala",
  noFixtures: "Amma taphni galmaa'e hin jiru.",

  kitTitle: "Uffata garee", kitLead: "Uffata akaadamii leenjii fi taphaaf.", sizes: "Qajeelfama hamma",
  kitHome: "Mana", kitAway: "Ala", kitTraining: "Leenjii", thSize: "Hamma", thAge: "Umurii",

  whyTitle: "Maaliif College Adama FC",
  whyLead: "Taphataa guutummaatti guddisna: dandeettii dirree irratti, sirna leenjii keessatti fi kabaja dirree alatti.",
  w1t: "Leenjistoota ogummaa qaban", w1: "Karoorri leenjii garee umurii hundaaf mijatu.",
  w2t: "Muuxannoo taphaa", w2: "Taphoota michummaa fi dorgommiiwwan yeroo ispoortii guutuu.",
  w3t: "Hordoffii guddinaa", w3: "Maatiin guddina ijoollee isaanii irratti odeeffannoo idilee argatu.",
  w4t: "Dursa amala", w4: "Hojii gareetii, sirna fi tapha qajeelaa leenjii hunda keessatti.",

  aboutTitle: "Waa'ee akaadaamichaa", missionT: "Ergama keenya", visionT: "Mul'ata keenya", valuesT: "Duudhaalee keenya",
  v1t: "Naamusa", v2t: "Hojii garee", v3t: "Kabaja", v4t: "Barnoota",

  galleryTitle: "Suuraalee leenjii", galleryLead: "Yeroo leenjii keenyaa irraa fakkeenyawwan.",
  newsTitle: "Oduu", noNews: "Amma oduun hin jiru.", latestNews: "Oduu haaraa", viewAll: "Hunda ilaali",

  payTitle: "Kaffaltii ji'aa",
  payLead: "Baankii Daldalaa Itiyoophiyaa (CBE) irratti kaffali, booda suuraa cuunfaa as ergi. Kaffaltiin hunduu qabaa kaffaltii irratti mirkanaa'a.",
  payNote: "Taphataan tarree keessa hin jiru yoo ta'e dursinee galmeessi.",
  fPlayer: "Taphataa", fReceipt: "Suuraa cuunfaa", btnPay: "Kaffaltii ergi", choose: "Taphataa filadhu",
  recTitle: "Cuunfaa taphataatiin", recLead: "Kaffaltii hundaa cuunfaan suuraa ta'een agarsiifama.",
  noReceipts: "Amma cuunfaan hin jiru.", all: "Hunda", pending: "Eeggachaa jira", verified: "Mirkanaa'e", rejected: "Diddee",

  joinTitle: "Akaadaamiitti makami",
  joinLead: "Odeeffannoo taphattichaa ergi; guyyaa qormaataa fi kaffaltii wajjin si waammanna.",
  fName: "Maqaa taphataa", fAge: "Umurii", fGroup: "Garee umurii", fStudentId: "Lakkoofsa barataa", fParent: "Maqaa maatii",
  fPhone: "Bilbila", btnSend: "Galmee ergi",

  contactTitle: "Nu quunnamaa", cPhone: "Bilbila", cEmail: "Imeelii", cAddress: "Teessoo",
  fYourName: "Maqaa kee", fMessage: "Ergaa", btnSendMsg: "Ergaa ergi",
  savedMsg: "Galatoomaa. Ergaa keessan fudhanneerra.",

  errReq: "Maaloo bakka hunda guuti suuraa cuunfaa daangessi.", errFields: "Maaloo bakka barbaachisu hunda guuti.",
  savedReg: "Galatoomaa. Galmee keessan fudhanneerra; dhiyootti isin waammanna.",
  savedPay: "Kaffaltiin ergameera. Haala: eeggachaa jira.",

  posGK: "Eeggattoota", posDEF: "Ittisitoota", posMID: "Giddu-galeessa", posFWD: "Lolitoota",
  starter: "Jalqabaa", backup: "Bakka bu'aa", added: "Haaraa", footR: "Miilaa mirga", footL: "Miilaa bitaa",
  squadsTitle: "Garee taphattootaa",
  squadsLead: "Gareen umurii hundaa keessatti taphattoota digdamii. Maqaan kun hanga tarreen dhugaa mirkanaa'eetti fakkeenya.",
  playersWord: "taphattoota",

  r_head: "Leenjistuu Ol-aanaa", r_asst: "Gargaaraa Leenjistuu", r_gk: "Leenjistuu Eeggataa", r_fit: "Leenjistuu Fitnessii",
  r_doc: "Ogeessa Fayyaa Garee", r_mgr: "Bulchaa Garee", r_second: "Leenjistuu Lammaffaa", r_coach: "Leenjistuu",

  backHome: "Gara jalqabaatti deebi'i",
  footer: "© 2026 Akaadaamii Kubbaa Miilaa Kolleejjii Adaamaa",
};

export const DICT: Record<Lang, Partial<Record<Key, string>>> = { en, am, om };
export const translate = (lang: Lang, key: Key) => DICT[lang][key] ?? en[key];
export const isKey = (k: string): k is Key => k in en;
