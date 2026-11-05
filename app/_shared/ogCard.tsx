import { ImageResponse } from "next/og";
import { person } from "./content";

/**
 * The share card: the drawing sheet's title block, in the site's own palette.
 * Used by both opengraph-image and twitter-image.
 */
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_ALT = `${person.name}, full-stack developer in Halifax, looking for a cyber security co-op`;

const PAPER = "#F7F7F5", INK = "#1A1C1F", STEEL = "#5B6670", RED = "#D23B2E", RULE = "rgba(26,28,31,0.22)";

/** Barlow Condensed from Google Fonts as TTF; the card falls back to the default face if the fetch fails. */
async function loadDisplayFont(): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch("https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700&display=swap", {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0" },
    }).then((r) => r.text());
    const url = css.match(/url\(([^)]+\.(?:woff|ttf))\)/)?.[1];
    if (!url) return null;
    return await fetch(url).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

export async function renderOgCard() {
  const font = await loadDisplayFont();
  const display = font ? "Barlow Condensed" : "sans-serif";
  const label = { fontSize: 15, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: STEEL, fontFamily: display };
  const cell = { display: "flex", flexDirection: "column" as const, gap: 6, padding: "14px 18px", background: PAPER };
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column",
          background: PAPER, color: INK, padding: 36, fontFamily: display,
        }}
      >
        <div style={{ display: "flex", flex: 1, border: `2px solid ${INK}`, padding: "44px 52px 40px", flexDirection: "column", justifyContent: "space-between", position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", ...label }}>
            <span>CrooksCodes · DWG CC-2026 · Sheet 1 of 1</span>
            <span>Halifax, Nova Scotia</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 30, marginBottom: 24 }}>
            <div style={{ fontSize: 150, fontWeight: 700, lineHeight: 0.9, letterSpacing: "-0.01em", textTransform: "uppercase", display: "flex", whiteSpace: "nowrap" }}>
              {person.name}
            </div>
            <div style={{ fontSize: 30, lineHeight: 1.3, maxWidth: 900, display: "flex", fontFamily: "sans-serif" }}>
              Full-stack developer. First year of computer science at Dalhousie, looking for a cyber security co-op.
            </div>
          </div>
          <div style={{ display: "flex", border: `2px solid ${INK}`, background: INK, gap: 2 }}>
            <div style={{ ...cell, flex: 1 }}><span style={label}>Drawn by</span><span style={{ fontSize: 24 }}>{person.name}</span></div>
            <div style={{ ...cell, flex: 1 }}><span style={label}>Shipped</span><span style={{ fontSize: 24 }}>Four web apps, three live</span></div>
            <div style={{ ...cell, flex: 1, color: RED }}><span style={{ ...label, color: RED }}>Contact</span><span style={{ fontSize: 24 }}>{person.email}</span></div>
          </div>
          <div style={{ position: "absolute", right: 52, top: 96, width: 2, height: 120, background: RULE, display: "flex" }} />
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: font ? [{ name: "Barlow Condensed", data: font, weight: 700, style: "normal" }] : undefined,
    },
  );
}
