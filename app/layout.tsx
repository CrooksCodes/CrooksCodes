import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import "./lock.css";

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const CONTRACT = `<!--
IMPECCABLE DIRECTION CONTRACT · seed b33fbed3 · surface /
THESIS: The portfolio as a locksmith's drawing sheet whose figure is a lit model of one door with five locks on its seam. It refuses the dark hacker page: a white sheet, ink lettering, real brass. Each block releases one lock, top to bottom, and the block itself unlocks with it; the door opens at the end.
OWN-WORLD: Sheet #F7F7F5, ink #1A1C1F, red #D23B2E only for the contact action and the seam. The figure is rendered, not drawn: lit brass (#c9a24d, metal, roughness 0.3) and satin steel hardware with screw heads, a painted panel leaf, a timber jamb, soft shadows under a room environment; the sheet's ink balloons on leader lines sit over it. The camera travels: wide on the whole door, close on the lock being worked, wide and stepped to the hinge side as the door opens. Barlow for text, Barlow Condensed for drawing titles, labels and tables, tabular numerals. Sheet border with zone marks, title block, balloon callouts on leader lines, lock schedule, revision table, parts list.
STORY: A hiring manager sees a precise section with Jeremy as draughtsman, reads a claim honest about year 1 and the cyber security co-op he wants, scrolls as the barrel bolt, deadbolt, chain, hasp and hook release one block at a time, and at contact the door swings open and the red action is right there.
FIRST VIEWPORT: Sheet border and zone marks frame the viewport; the 3D door and jamb elevation with its five locks owns the right 55% at drawing scale; left: the name as the drawing title, the claim, the red action, and a Drawn by / Location / Status / Looking for block.
FORM: Lock cutaway, pick card (candidate 1 of 7), re-roll hand 1, seed key b33fbed3.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
-->`;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://crookscodes.com";
const siteName = "CrooksCodes";
const title = "Jeremy Crooks · Halifax · CrooksCodes";
const description =
  "Jeremy Crooks, full-stack developer in Halifax and first-year computer science student at Dalhousie, looking for a cyber security co-op. Four shipped web apps, drawn as a door with five locks.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s · CrooksCodes",
  },
  description,
  applicationName: siteName,
  authors: [{ name: "Jeremy Crooks", url: siteUrl }],
  creator: "Jeremy Crooks",
  publisher: "Jeremy Crooks",
  keywords: [
    "Jeremy Crooks",
    "Full-Stack Developer",
    "Next.js",
    "TypeScript",
    "React",
    "Node.js",
    "Halifax",
    "Nova Scotia",
    "Portfolio",
    "Matrix Code",
    "Dalhousie",
    "Cyber security co-op",
  ],
  category: "technology",
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName,
    title,
    description,
    locale: "en_CA",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
};

export const viewport: Viewport = {
  themeColor: "#F7F7F5",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${barlow.variable} ${barlowCondensed.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="lock-root">
          <div hidden dangerouslySetInnerHTML={{ __html: CONTRACT }} />
          {children}
        </div>
      </body>
    </html>
  );
}
