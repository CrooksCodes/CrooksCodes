"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { preload } from "react-dom";
import { education, experience, person, projects, skills } from "./_shared/content";
import { useContactForm } from "./_shared/useContactForm";
import { DOOR, FIGURE_ITEMS, LOCKS } from "./lockSpec";

// Three.js and the model load after the page is readable; nothing waits on them
const LockScene = dynamic(() => import("./LockScene"), { ssr: false });

const NAV = [
  { id: "about", label: "Notes" },
  { id: "projects", label: "Figures" },
  { id: "skills", label: "Parts" },
  { id: "experience", label: "Revisions" },
  { id: "contact", label: "Contact" },
];

/** Items 1 to 7 are the figure's own parts; the stack follows as 8 onward. */
const FIGURE_PARTS = FIGURE_ITEMS.map((s) => ({ s, g: "Figure" }));

const ArrowOut = () => (
  <svg className="ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M6 4h6v6" /></svg>
);
const ArrowDown = () => (
  <svg className="ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3v10M4 9l4 4 4-4" /></svg>
);

/** Fixed drawing-sheet border with zone marks in the margins. */
function SheetFrame() {
  const letters = ["A", "B", "C", "D", "E", "F"];
  const numbers = ["1", "2", "3", "4", "5", "6", "7", "8"];
  return (
    <div className="sheet-frame" aria-hidden="true">
      <div className="zone zone--top">{numbers.map((n) => <span key={n}>{n}</span>)}</div>
      <div className="zone zone--bottom">{numbers.map((n) => <span key={n}>{n}</span>)}</div>
      <div className="zone zone--left">{letters.map((l) => <span key={l}>{l}</span>)}</div>
      <div className="zone zone--right">{letters.map((l) => <span key={l}>{l}</span>)}</div>
      <div className="sheet-border" />
    </div>
  );
}

function Nav({ active }: { active: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    const onDown = (e: PointerEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("pointerdown", onDown); };
  }, [open]);
  const current = NAV.find((n) => n.id === active || (active === "education" && n.id === "experience"));
  return (
    <nav className="lock-nav" ref={ref} aria-label="Sheet">
      <a className="nav-brand" href="#top">
        <span className="nav-brand-name">CrooksCodes</span>
        <span className="nav-brand-no">DWG CC-2026 · SHEET 1 OF 1</span>
      </a>
      <button type="button" className="nav-toggle" aria-expanded={open} aria-controls="lock-menu" onClick={() => setOpen((o) => !o)}>
        {open ? "Close" : "Menu"}
      </button>
      <ul id="lock-menu" className={open ? "nav-list is-open" : "nav-list"}>
        {NAV.map((n) => (
          <li key={n.id}>
            <a href={`#${n.id}`} aria-current={current?.id === n.id ? "location" : undefined} onClick={() => setOpen(false)}>
              {n.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function ContactForm() {
  const f = useContactForm();
  if (f.status === "success") {
    return (
      <div className="form-done" role="status" aria-live="polite">
        <p>Sent. Thanks, I&apos;ll be in touch.</p>
        <button type="button" className="link-quiet" onClick={f.reset}>Send another</button>
      </div>
    );
  }
  const busy = f.status === "submitting";
  return (
    <form className="form" onSubmit={f.submit} noValidate>
      <div className="field">
        <label htmlFor="lk-name">Name</label>
        <input id="lk-name" name="name" value={f.name} onChange={(e) => f.setName(e.target.value)} minLength={2} maxLength={100} required autoComplete="name" disabled={busy} />
      </div>
      <div className="field">
        <label htmlFor="lk-email">Email</label>
        <input id="lk-email" name="email" type="email" value={f.email} onChange={(e) => f.setEmail(e.target.value)} required autoComplete="email" disabled={busy} />
      </div>
      <div className="field field--wide">
        <label htmlFor="lk-message">Message <span className="field-count">{f.message.length} / 1000</span></label>
        <textarea id="lk-message" name="message" rows={5} value={f.message} onChange={(e) => f.setMessage(e.target.value)} minLength={10} maxLength={1000} required disabled={busy} />
      </div>
      {f.status === "error" && <p className="form-error" role="alert">{f.error}</p>}
      <div className="field--wide form-actions">
        <button type="submit" className="action" disabled={busy}>{busy ? "Sending" : "Send message"}</button>
        <span className="form-note">Or email <a href={`mailto:${person.email}`}>{person.email}</a></span>
      </div>
    </form>
  );
}

export default function LockPage() {
  preload("/models/door.glb", { as: "fetch", crossOrigin: "anonymous" });
  const [active, setActive] = useState("about");
  useEffect(() => {
    const ids = ["about", "projects", "skills", "experience", "education", "contact"];
    const obs = new IntersectionObserver((entries) => {
      const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (vis[0]) setActive(vis[0].target.id);
    }, { rootMargin: "-22% 0px -66% 0px", threshold: 0 });
    ids.forEach((id) => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <a className="skip" href="#projects">Skip to the figures</a>
      <SheetFrame />
      <LockScene />
      <div className="sheet" id="top">
        <Nav active={active} />

        <main className="content">
          <header className="hero">
            <div className="hero-left">
            <h1 className="title">{person.name}</h1>
            <p className="claim">
              Full-stack developer in Halifax, first year of computer science at Dalhousie.
              I ship whole web apps, and I&apos;m after a cyber security <span className="nowrap">co-op</span> because
              the interesting part is where they come apart.
            </p>
            <div className="hero-actions">
              <a className="action" href="#contact">Send a message</a>
              <a className="link-quiet" href="#projects">See the figures <ArrowDown /></a>
            </div>
            </div>
            <div className="hero-right">
            <dl className="kv">
              <div><dt>Drawn by</dt><dd>{person.name}</dd></div>
              <div><dt>Location</dt><dd>{person.city}</dd></div>
              <div><dt>Status</dt><dd>B.C.S. year 1 of 4, Dalhousie University</dd></div>
              <div><dt>Looking for</dt><dd>Cyber security co-op</dd></div>
            </dl>
            <p className="hero-hint">Scroll. Five locks release one block at a time, top to bottom, and the door opens at the end. Each lock is a security layer.</p>
            </div>
          </header>

          <section id="about" className="block block--left">
            <h2 className="block-tab">Notes</h2>
            <p className="block-layer"><span>Lock 1 · {LOCKS[0].name} · {LOCKS[0].layer}</span>{LOCKS[0].layerNote}</p>
            <p className="block-lead">Getting the foundations right is most of the job.</p>
            <div className="block-gate">
              <div className="block-shutter" aria-hidden="true"><span>Locked</span></div>
              <div className="block-inner">
            <ol className="notes">
              <li>
                I build websites and web apps end to end: the screens people use, and the API and
                database behind them. Most of the real work sits at the seams, where the frontend
                meets the API and the API meets the data.
              </li>
              <li>
                Since May 2026 this has been paid work. I maintain One North End&apos;s website and
                internal tools, and I co-run Dory Digital, where I build every client site from scratch.
              </li>
              <li>
                Cyber security is where I&apos;m headed. Year 1 of 4 at Dalhousie. I don&apos;t have
                security work to show yet, so this sheet shows what I do have: shipped software and the
                habit of taking it apart to see how it fails. Five locks on one door is the drawing&apos;s joke about defence in depth; the sheet opens them one block at a time.
              </li>
              <li>
                This page is part of the evidence. Next.js, hand-written CSS, a door modelled in Blender, and one
                Three.js scene driven by scroll position. No template.
              </li>
            </ol>
            <table className="tbl tbl--schedule">
              <caption>Lock schedule: each lock, the layer it stands for, and the block that releases it</caption>
              <thead><tr><th scope="col">Item</th><th scope="col">Lock</th><th scope="col">Layer</th><th scope="col">Released by</th></tr></thead>
              <tbody>
                {LOCKS.map((l) => (
                  <tr key={l.n}>
                    <td>{l.n}</td><td>{l.name}</td><td>{l.layer}</td><td>{l.sectionLabel}</td>
                  </tr>
                ))}
                <tr>
                  <td>6</td><td>Door leaf</td><td>{DOOR.layer}</td><td>Title block</td>
                </tr>
              </tbody>
            </table>
              </div>
            </div>
          </section>

          <section id="projects" className="block block--right">
            <h2 className="block-tab">Figures</h2>
            <p className="block-layer"><span>Lock 2 · {LOCKS[1].name} · {LOCKS[1].layer}</span>{LOCKS[1].layerNote}</p>
            <p className="block-lead">Four things I shipped. Three are live.</p>
            <div className="block-gate">
              <div className="block-shutter" aria-hidden="true"><span>Locked</span></div>
              <div className="block-inner">
            <div className="figs">
              {projects.map((p, i) => {
                const n = i + 1;
                const live = p.status === "live" && p.href && p.image;
                return (
                  <figure key={p.id} className={live ? "fig" : "fig fig--prelim"} id={`fig-${n}`}>
                    <div className="fig-frame">
                      {live ? (
                        <a href={p.href} target="_blank" rel="noreferrer" className="fig-views" aria-label={`Open ${p.title} in a new tab`}>
                          <span className="view view--a">
                            <img src={p.image!.desktop} alt={`${p.title}, desktop view`} width={1440} height={900} loading={n === 1 ? "eager" : "lazy"} decoding="async" />
                            <span className="view-label">View A · desktop</span>
                          </span>
                          <span className="view view--b">
                            <img src={p.image!.mobile} alt={`${p.title}, phone view`} width={390} height={844} loading="lazy" decoding="async" />
                            <span className="view-label">View B · phone</span>
                          </span>
                        </a>
                      ) : (
                        <div className="fig-views fig-views--prelim">
                          <span className="stamp">Preliminary<br />not for release</span>
                        </div>
                      )}
                    </div>
                    <figcaption className="fig-cap">
                      <span className="fig-no">Fig. {n}</span>
                      <h3 className="fig-title">{p.title}</h3>
                      <p className="fig-summary">{p.summary}</p>
                      <p className="fig-body">{p.body}</p>
                      <p className="fig-meta">
                        <span className="fig-stack">{p.stack.join(" · ")}</span>
                        {live ? (
                          <a className="fig-link" href={p.href} target="_blank" rel="noreferrer">Open site <ArrowOut /></a>
                        ) : (
                          <span className="fig-link fig-link--off">In progress, {p.year}</span>
                        )}
                      </p>
                    </figcaption>
                  </figure>
                );
              })}
            </div>
              </div>
            </div>
          </section>

          <section id="skills" className="block block--left">
            <h2 className="block-tab">Parts list</h2>
            <p className="block-layer"><span>Lock 3 · {LOCKS[2].name} · {LOCKS[2].layer}</span>{LOCKS[2].layerNote}</p>
            <p className="block-lead">What the figure, and the figures, are made of.</p>
            <div className="block-gate">
              <div className="block-shutter" aria-hidden="true"><span>Locked</span></div>
              <div className="block-inner">
            <table className="tbl tbl--parts">
              <caption className="sr">Parts list, grouped</caption>
              <thead><tr><th scope="col">Item</th><th scope="col">Part</th><th scope="col">Group</th></tr></thead>
              <tbody>
                {[...FIGURE_PARTS, ...skills.flatMap((g) => g.items.map((s) => ({ g: g.title, s })))].map((row, i) => (
                  <tr key={row.s}>
                    <td>{String(i + 1).padStart(2, "0")}</td><td>{row.s}</td><td>{row.g}</td>
                  </tr>
                ))}
              </tbody>
            </table>
              </div>
            </div>
          </section>

          <section id="experience" className="block block--right">
            <h2 className="block-tab">Revisions</h2>
            <p className="block-layer"><span>Lock 4 · {LOCKS[3].name} · {LOCKS[3].layer}</span>{LOCKS[3].layerNote}</p>
            <p className="block-lead">Where I&apos;ve worked.</p>
            <div className="block-gate">
              <div className="block-shutter" aria-hidden="true"><span>Locked</span></div>
              <div className="block-inner">
            <table className="tbl tbl--rev">
              <caption className="sr">Experience, by revision</caption>
              <thead><tr><th scope="col">Rev</th><th scope="col">Date</th><th scope="col">Description</th><th scope="col">By</th></tr></thead>
              <tbody>
                {experience.map((e, i) => (
                  <tr key={e.org}>
                    <td>{String.fromCharCode(65 + experience.length - 1 - i)}</td>
                    <td>{e.label}</td>
                    <td><strong>{e.role}, {e.org}.</strong> {e.body}</td>
                    <td>JC</td>
                  </tr>
                ))}
              </tbody>
            </table>
              </div>
            </div>
          </section>

          <section id="education" className="block block--left block--tight">
            <h2 className="block-tab block-tab--quiet">Revisions, continued</h2>
            <p className="block-layer"><span>Lock 5 · {LOCKS[4].name} · {LOCKS[4].layer}</span>{LOCKS[4].layerNote}</p>
            <p className="block-lead">Where I&apos;ve studied.</p>
            <div className="block-gate">
              <div className="block-shutter" aria-hidden="true"><span>Locked</span></div>
              <div className="block-inner">
            <table className="tbl tbl--rev">
              <caption className="sr">Education, by revision</caption>
              <thead><tr><th scope="col">Rev</th><th scope="col">Date</th><th scope="col">Description</th><th scope="col">By</th></tr></thead>
              <tbody>
                {education.map((e, i) => (
                  <tr key={e.org}>
                    <td>{String.fromCharCode(65 + education.length - 1 - i)}</td>
                    <td>{e.label}</td>
                    <td><strong>{e.role}, {e.org}.</strong> {e.body}</td>
                    <td>JC</td>
                  </tr>
                ))}
              </tbody>
            </table>
              </div>
            </div>
          </section>

          <section id="contact" className="block block--right">
            <h2 className="block-tab">Title block</h2>
            <p className="block-layer"><span>The door · {DOOR.layer}</span>{DOOR.layerNote}</p>
            <p className="block-lead">Hiring for a security co-op? Let&apos;s talk.</p>
            <div className="block-gate">
              <div className="block-shutter" aria-hidden="true"><span>Locked</span></div>
              <div className="block-inner">
            <div className="titleblock">
              <div className="tb-cell"><span className="tb-k">Drawn by</span><span className="tb-v">{person.name}</span></div>
              <div className="tb-cell"><span className="tb-k">Status</span><span className="tb-v">Open to a cyber security co-op</span></div>
              <div className="tb-cell"><span className="tb-k">Location</span><span className="tb-v">{person.city}</span></div>
              <div className="tb-cell"><span className="tb-k">Email</span><a className="tb-v" href={`mailto:${person.email}`}>{person.email}</a></div>
              <div className="tb-cell"><span className="tb-k">GitHub</span><a className="tb-v" href={person.github.url} target="_blank" rel="noreferrer">@{person.github.handle}</a></div>
              <div className="tb-cell"><span className="tb-k">LinkedIn</span><a className="tb-v" href={person.linkedin.url} target="_blank" rel="noreferrer">{person.linkedin.handle}</a></div>
              <div className="tb-cell tb-cell--form"><ContactForm /></div>
            </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="lock-footer">
          <span>{person.brand} · {person.name} · {person.city}</span>
          <span>Captures of the live sites taken 2026-11-04</span>
          <span>Sheet 1 of 1</span>
        </footer>
      </div>
    </>
  );
}
