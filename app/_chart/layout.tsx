import type { Metadata } from "next";
import { Archivo, Archivo_Narrow } from "next/font/google";
import "./chart.css";

const archivo = Archivo({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

const archivoNarrow = Archivo_Narrow({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-archivo-narrow",
  display: "swap",
});

export const metadata: Metadata = {
  title: { absolute: "Jeremy Crooks · Halifax · CrooksCodes" },
  description:
    "Jeremy Crooks, full-stack developer in Halifax, Nova Scotia. First year of computer science at Dalhousie, headed for cyber security and looking for a co-op. Four shipped projects, three live.",
};

// Direction contract. Kept as a real HTML comment so it survives the production build.
const CONTRACT = `<!--
DIRECTION CONTRACT, seed b33fbed3
THESIS: The portfolio as a hydrographic chart of Halifax Harbour. It refuses the hero-then-cards scroll: every block on the page is a block a chart already has (title, insets, symbols legend, notices, compass).
OWN-WORLD: White deep water; contour bands in pale blues (#CFE6F2, #9CC9E3, deep #6FAFD3); buff land #F1E3B3; ink #111418; magenta #C8128E reserved for the one action (contact) and notice marks. Archivo for lettering, Archivo Narrow for soundings and tables, italic for water names. Graduated chart border, compass rose, scattered soundings, framed insets, dated notice rows.
STORY: A hiring manager reads "Jeremy Crooks, Halifax" as a chart title, sees four insets of real shipped products with real captures, reads he is first-year CS at Dalhousie headed for cyber security, and sends a message from the magenta notice.
FIRST VIEWPORT: Title block top-left (name as chart title, one-line claim, magenta contact notice); the 3D relief owns the right 55%; contour bands sweep behind; nav as the chart's margin index along the top border.
FORM: Harbour chart, candidate 7 of 7, re-roll hand 1, seed key b33fbed3.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
-->`;

export default function ChartLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={`chart-root ${archivo.variable} ${archivoNarrow.variable}`}>
      <div hidden dangerouslySetInnerHTML={{ __html: CONTRACT }} />
      {children}
    </div>
  );
}
