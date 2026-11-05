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

/*
IMPECCABLE DIRECTION CONTRACT · seed b33fbed3 · surface /
THESIS: The portfolio as a drawing sheet whose figure is a hand-pressed clay door with five locks on its seam. It refuses the dark hacker page: a pale sheet, ink lettering, a slate door with brass and pewter hardware. Each section releases one lock as it comes into view; at Contact the door opens on warm light.
OWN-WORLD: Sheet #F7F7F5, ink #1A1C1F, red #D23B2E only for the contact action and the seam. The figure is a matte clay model from Blender on a boxless full-bleed canvas behind opaque paper panels. Sheet border and zone marks stay as texture; every label and heading uses plain words (About, Projects, Skills, Experience, Education, Contact). Barlow for text, Barlow Condensed for titles, labels and tables, tabular numerals.
STORY: A hiring manager sees the door, the name, an honest claim about year 1 and the co-op, and how to reach Jeremy, all in one screen. Scrolling releases one lock per section without ever hiding what they came to read, and at Contact the door swings open beside the form.
FIRST VIEWPORT: Sheet border and zone marks frame the viewport; the whole door owns the right half; left: the name, the claim, the red action, and Email / GitHub / LinkedIn / Looking for.
FORM: Lock cutaway, pick card (candidate 1 of 7), re-roll hand 1, seed key b33fbed3.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
*/

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://crookscodes.com";
const siteName = "CrooksCodes";
const title = "Jeremy Crooks · Halifax · CrooksCodes";
const description =
  "Jeremy Crooks, full-stack developer in Halifax and first-year computer science student at Dalhousie, looking for a cyber security co-op. Three web apps live, a fourth in progress.";

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
          {children}
        </div>
      </body>
    </html>
  );
}
