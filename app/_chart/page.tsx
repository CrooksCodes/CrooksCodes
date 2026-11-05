"use client";

import { useEffect, useRef, useState } from "react";
import {
  education,
  experience,
  person,
  projects,
  sectionIds,
  skills,
  type Project,
  type SectionId,
  type TimelineEntry,
} from "../_shared/content";
import { useContactForm } from "../_shared/useContactForm";
import ChartScene from "./ChartScene";

const NAV_LABELS: Record<SectionId, string> = {
  about: "About",
  projects: "Projects",
  skills: "Skills",
  experience: "Experience",
  education: "Education",
  contact: "Contact",
};
const INSET_LETTERS = ["A", "B", "C", "D"];
const CAPTURED = { iso: "2026-11-04", text: "4 Nov 2026" };

// ── icons: drawn, one stroke weight ─────────────────────────────────────────
const IconArrow = () => (
  <svg className="chart-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 8h11M9.5 3.5 14 8l-4.5 4.5" /></svg>
);
const IconExternal = () => (
  <svg className="chart-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 12.5 12.5 3.5M6 3.5h6.5V10" /></svg>
);
const IconChevron = () => (
  <svg className="chart-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 6l5 5 5-5" /></svg>
);
const NoticeMark = () => (
  <svg className="chart-icon" viewBox="0 0 12 12" aria-hidden="true"><path d="M6 0.5 11.5 6 6 11.5 0.5 6Z" /></svg>
);

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  history.pushState(null, "", `#${id}`);
  el.focus({ preventScroll: true });
}

// ── scroll spy ──────────────────────────────────────────────────────────────
function useCurrentSection(): SectionId | null {
  const [current, setCurrent] = useState<SectionId | null>(null);
  useEffect(() => {
    const els = sectionIds.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => Boolean(el));
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setCurrent(visible[0].target.id as SectionId);
        else if (window.scrollY < window.innerHeight * 0.5) setCurrent(null);
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return current;
}

// ── margin index (nav) ──────────────────────────────────────────────────────
function MarginIndex({ current, readoutRef }: { current: SectionId | null; readoutRef: React.RefObject<HTMLSpanElement | null> }) {
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    const onDown = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <nav className="chart-nav" aria-label="Chart index" ref={navRef}>
      <a
        className="chart-brand"
        href="#top"
        onClick={(e) => {
          e.preventDefault();
          const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
          history.pushState(null, "", "/chart");
        }}
      >
        {person.brand}
      </a>
      <span className="chart-readout" ref={readoutRef} aria-hidden="true">Tilt 06° · Lift 0.00</span>
      <button
        type="button"
        className="chart-index-toggle"
        aria-expanded={open}
        aria-controls="chart-index"
        onClick={() => setOpen((o) => !o)}
      >
        Index <IconChevron />
      </button>
      <ul id="chart-index" className="chart-index" data-open={open}>
        {sectionIds.map((id) => (
          <li key={id}>
            <a
              href={`#${id}`}
              aria-current={current === id ? "true" : undefined}
              onClick={(e) => { e.preventDefault(); scrollToId(id); setOpen(false); }}
            >
              {NAV_LABELS[id]}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// ── compass rose ────────────────────────────────────────────────────────────
function CompassRose({ className }: { className?: string }) {
  const c = 80;
  const p = (a: number, r: number) => `${(c + Math.cos(a) * r).toFixed(1)} ${(c + Math.sin(a) * r).toFixed(1)}`;
  let ticks = "";
  for (let i = 0; i < 36; i++) {
    const a = (i * Math.PI) / 18;
    ticks += `M${p(a, i % 9 === 0 ? 62 : 67)}L${p(a, 74)}`;
  }
  let star = "";
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI) / 8 - Math.PI / 2;
    star += `M${c} ${c}L${p(a, i % 4 === 0 ? 58 : i % 2 === 0 ? 42 : 26)}`;
  }
  return (
    <svg viewBox="0 0 160 160" className={className} aria-hidden="true">
      <circle cx={c} cy={c} r={74} />
      <circle cx={c} cy={c} r={62} />
      <path d={ticks} />
      <path d={star} />
      <circle cx={c} cy={c} r={3} />
      <path d={`M${c} ${c - 58}l4.5 11h-9z`} fill="currentColor" />
      <text x={c} y={c - 34} textAnchor="middle">N</text>
    </svg>
  );
}

// ── section heading row ─────────────────────────────────────────────────────
function Heading({ id, title, term }: { id: string; title: string; term: string }) {
  return (
    <div className="chart-h2-row">
      <h2 className="chart-h2" id={id}>{title}</h2>
      <span className="chart-h2-term">{term}</span>
    </div>
  );
}

// ── projects: insets ────────────────────────────────────────────────────────
function Inset({ p, letter }: { p: Project; letter: string }) {
  const host = p.href ? new URL(p.href).host : null;
  const unsurveyed = p.status !== "live";
  const titleId = `inset-${letter.toLowerCase()}-title`;
  return (
    <article
      className={unsurveyed ? "chart-panel chart-inset chart-inset--unsurveyed" : "chart-panel chart-inset"}
      id={`inset-${letter.toLowerCase()}`}
      aria-labelledby={titleId}
    >
      <span className="chart-inset-tab">Inset {letter}</span>
      <div className="chart-inset-shot">
        {p.image ? (
          <>
            <img
              className="chart-shot-desktop"
              src={p.image.desktop}
              alt={`${p.title}, desktop view, captured ${CAPTURED.text}`}
              width={1440}
              height={900}
              loading="lazy"
              decoding="async"
            />
            <img
              className="chart-shot-mobile"
              src={p.image.mobile}
              alt=""
              width={390}
              height={844}
              loading="lazy"
              decoding="async"
            />
          </>
        ) : (
          <p className="chart-unsurveyed"><em>Unsurveyed</em><span>Survey in progress, 2026</span></p>
        )}
      </div>
      <div className="chart-inset-body">
        <h3 id={titleId}>{p.title}</h3>
        <p className="chart-inset-summary">{p.summary}</p>
        <p>{p.body}</p>
        <dl className="chart-inset-meta">
          <dt>Built with</dt>
          <dd>{p.stack.join(", ")}</dd>
          <dt>Status</dt>
          <dd>
            {p.href ? (
              <a href={p.href} target="_blank" rel="noreferrer">
                Live at {host} <IconExternal />
              </a>
            ) : (
              "In progress, no public link yet"
            )}
          </dd>
          {p.image && (
            <>
              <dt>Capture</dt>
              <dd>From the live site, <time dateTime={CAPTURED.iso}>{CAPTURED.text}</time></dd>
            </>
          )}
        </dl>
      </div>
    </article>
  );
}

// ── experience and education: notices ───────────────────────────────────────
function Notices({ entries, caption }: { entries: TimelineEntry[]; caption: string }) {
  return (
    <table className="chart-notices">
      <caption className="chart-sr">{caption}</caption>
      <colgroup>
        <col className="c-date" />
        <col className="c-notice" />
        <col className="c-detail" />
      </colgroup>
      <thead>
        <tr><th scope="col">Date</th><th scope="col">Notice</th><th scope="col">Detail</th></tr>
      </thead>
      <tbody>
        {entries.map((e) => (
          <tr key={`${e.role}-${e.org}`}>
            <td><time dateTime={e.from}>{e.label}</time></td>
            <td><strong>{e.role}</strong><span className="chart-org">{e.org}</span></td>
            <td>{e.body}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── contact form ────────────────────────────────────────────────────────────
function ContactForm() {
  const f = useContactForm();
  if (f.status === "success") {
    return (
      <div className="chart-form-success" role="status" aria-live="polite">
        <p>Sent. I&apos;ll reply from {person.email}.</p>
        <button type="button" className="chart-linkbtn" onClick={f.reset}>Send another message</button>
      </div>
    );
  }
  const busy = f.status === "submitting";
  return (
    <form className="chart-form" onSubmit={f.submit} noValidate>
      <div className="chart-field">
        <label htmlFor="chart-name">Name</label>
        <input id="chart-name" name="name" value={f.name} onChange={(e) => f.setName(e.target.value)} minLength={2} maxLength={100} required autoComplete="name" disabled={busy} />
      </div>
      <div className="chart-field">
        <label htmlFor="chart-email">Email</label>
        <input id="chart-email" name="email" type="email" value={f.email} onChange={(e) => f.setEmail(e.target.value)} required autoComplete="email" disabled={busy} />
      </div>
      <div className="chart-field">
        <label htmlFor="chart-message">Message <span className="chart-count">{f.message.length}/1000</span></label>
        <textarea id="chart-message" name="message" value={f.message} onChange={(e) => f.setMessage(e.target.value)} rows={5} minLength={10} maxLength={1000} required disabled={busy} />
      </div>
      {f.status === "error" && (
        <p className="chart-form-error" role="alert">
          <span className="chart-notice-mark"><NoticeMark /> Notice</span>
          <span>{f.error}</span>
        </p>
      )}
      <button type="submit" className="chart-submit" disabled={busy}>
        {busy ? "Sending" : "Send message"} <IconArrow />
      </button>
    </form>
  );
}

// ── page ────────────────────────────────────────────────────────────────────
export default function ChartPage() {
  const current = useCurrentSection();
  const readoutRef = useRef<HTMLSpanElement>(null);
  const groupLetters = ["L", "F", "D"];

  return (
    <>
      <a className="chart-skip" href="#about">Skip to content</a>
      <ChartScene readoutRef={readoutRef} />
      <div className="chart-frame" aria-hidden="true" />
      <MarginIndex current={current} readoutRef={readoutRef} />

      <main className="chart-sheet" id="top">
        {/* title block */}
        <header className="chart-hero chart-grid">
          <div className="chart-title-block">
            <h1 className="chart-h1">{person.name}</h1>
            <p className="chart-subtitle">{person.city}</p>
            <p className="chart-claim">
              Full-stack developer. I build websites and web apps end to end, the parts people click and the parts
              that run quietly behind them. First year of computer science at Dalhousie, headed for cyber security.
            </p>
            <p className="chart-notice">
              <span className="chart-notice-mark"><NoticeMark /> Notice</span>
              <span>Looking for a cyber security co-op.</span>
              <a className="chart-action" href="#contact" onClick={(e) => { e.preventDefault(); scrollToId("contact"); }}>
                Send a message <IconArrow />
              </a>
            </p>
            <p className="chart-marginalia">{person.brand} · Edition 2026 · Sheet 1 of 1</p>
          </div>
          <CompassRose className="chart-rose" />
        </header>

        {/* about: notes */}
        <section id="about" className="chart-section chart-grid" tabIndex={-1} aria-labelledby="about-h">
          <Heading id="about-h" title="About" term="Notes" />
          <div className="chart-panel chart-about">
            <ol className="chart-notes">
              <li>
                I build websites and web apps end to end: the screens people click and the systems running behind
                them. The seams are where most of the work lives, where the frontend meets the API and the API meets
                the database. Getting those boundaries right is what separates code that ships from code that lasts.
              </li>
              <li>
                First year of a Bachelor of Computer Science at Dalhousie University, 2026 to 2030, working toward
                cyber security. I want to spend the next few years learning how things break, on purpose, with
                permission.
              </li>
              <li>
                Co-founder and web developer at Dory Digital, a Halifax web business where I build every client site
                from design through deployment. Also the web developer at One North End, maintaining their site and
                building internal tools for their programs and staff.
              </li>
              <li>Based in Halifax, Nova Scotia. Looking for a cyber security co-op.</li>
            </ol>
          </div>
        </section>

        {/* projects: insets */}
        <section id="projects" className="chart-section chart-grid" tabIndex={-1} aria-labelledby="projects-h">
          <Heading id="projects-h" title="Projects" term="Insets A to D" />
          <p className="chart-lead">
            Four insets. Three are live and open in a new tab. The fourth is still being surveyed.
          </p>
          <div className="chart-insets">
            {projects.map((p, i) => <Inset key={p.id} p={p} letter={INSET_LETTERS[i]} />)}
          </div>
        </section>

        {/* skills: symbols and abbreviations */}
        <section id="skills" className="chart-section chart-grid" tabIndex={-1} aria-labelledby="skills-h">
          <Heading id="skills-h" title="Skills" term="Symbols and abbreviations" />
          <div className="chart-panel chart-legend">
            <div className="chart-legend-cols">
              {skills.map((g, gi) => (
                <table key={g.title}>
                  <caption>{g.title}</caption>
                  <tbody>
                    {g.items.map((item, i) => (
                      <tr key={item}>
                        <th scope="row">{groupLetters[gi]} {i + 1}</th>
                        <td>{item}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ))}
            </div>
          </div>
        </section>

        {/* experience: notices */}
        <section id="experience" className="chart-section chart-grid" tabIndex={-1} aria-labelledby="experience-h">
          <Heading id="experience-h" title="Experience" term="Notices" />
          <div className="chart-panel chart-notices-wrap">
            <Notices entries={experience} caption="Experience, by date" />
          </div>
        </section>

        {/* education: notices */}
        <section id="education" className="chart-section chart-grid" tabIndex={-1} aria-labelledby="education-h">
          <Heading id="education-h" title="Education" term="Notices" />
          <div className="chart-panel chart-notices-wrap">
            <Notices entries={education} caption="Education, by date" />
          </div>
        </section>

        {/* contact */}
        <section id="contact" className="chart-section chart-grid" tabIndex={-1} aria-labelledby="contact-h">
          <Heading id="contact-h" title="Contact" term="Notice" />
          <div className="chart-panel chart-contact">
            <p className="chart-contact-notice">
              <span className="chart-notice-mark"><NoticeMark /> Notice</span>
              Looking for a cyber security co-op. If you&apos;re hiring, or you want to talk about any of the insets
              above, send a message. Replies come from {person.email}.
            </p>
            <ContactForm />
            <dl className="chart-links">
              <dt>Email</dt>
              <dd><a href={`mailto:${person.email}`}>{person.email}</a></dd>
              <dt>GitHub</dt>
              <dd><a href={person.github.url} target="_blank" rel="noreferrer">@{person.github.handle} <IconExternal /></a></dd>
              <dt>LinkedIn</dt>
              <dd><a href={person.linkedin.url} target="_blank" rel="noreferrer">{person.linkedin.handle} <IconExternal /></a></dd>
            </dl>
          </div>
        </section>

        <footer className="chart-footer">
          <span>{person.brand} · {person.city} · Edition 2026 · Sheet 1 of 1</span>
          <span>Drawn by hand with Next.js and Three.js</span>
        </footer>
      </main>
    </>
  );
}
