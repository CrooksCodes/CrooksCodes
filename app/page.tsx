"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { preload } from "react-dom";
import { education, experience, person, projects, skills, type TimelineEntry } from "./_shared/content";
import { useContactForm } from "./_shared/useContactForm";
import { LOCKS } from "./lockSpec";

// Three.js and the model load after the page is readable; nothing waits on them
const LockScene = dynamic(() => import("./LockScene"), { ssr: false });

const NAV = [
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "education", label: "Education" },
  { id: "contact", label: "Contact" },
];

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
  return (
    <nav className="lock-nav" ref={ref} aria-label="Sections">
      <a className="nav-brand" href="#top">
        <span className="nav-brand-name">CrooksCodes</span>
        <span className="nav-brand-no">{person.city}</span>
      </a>
      <button type="button" className="nav-toggle" aria-expanded={open} aria-controls="lock-menu" onClick={() => setOpen((o) => !o)}>
        {open ? "Close" : "Menu"}
      </button>
      <ul id="lock-menu" className={open ? "nav-list is-open" : "nav-list"}>
        {NAV.map((n) => (
          <li key={n.id}>
            <a href={`#${n.id}`} aria-current={active === n.id ? "location" : undefined} onClick={() => setOpen(false)}>
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
  const formRef = useRef<HTMLFormElement>(null);
  const { fieldErrors } = f;
  // a failed submit moves focus to the first field that needs fixing
  useEffect(() => {
    if (f.status === "error") formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [f.status, f.submitCount]);
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
    <form className="form" ref={formRef} method="post" action="/api/contact" onSubmit={f.submit} noValidate>
      <div className="field">
        <label htmlFor="lk-name">Name</label>
        <input id="lk-name" name="name" value={f.name} onChange={(e) => f.setName(e.target.value)} minLength={2} maxLength={100} required autoComplete="name" disabled={busy} aria-invalid={!!fieldErrors.name} aria-describedby={fieldErrors.name ? "lk-name-err" : undefined} />
        {fieldErrors.name && <p className="field-error" id="lk-name-err">{fieldErrors.name}</p>}
      </div>
      <div className="field">
        <label htmlFor="lk-email">Email</label>
        <input id="lk-email" name="email" type="email" value={f.email} onChange={(e) => f.setEmail(e.target.value)} required autoComplete="email" disabled={busy} aria-invalid={!!fieldErrors.email} aria-describedby={fieldErrors.email ? "lk-email-err" : undefined} />
        {fieldErrors.email && <p className="field-error" id="lk-email-err">{fieldErrors.email}</p>}
      </div>
      <div className="field field--wide">
        <label htmlFor="lk-message">Message <span className="field-count">{f.message.length} / 1000</span></label>
        <textarea id="lk-message" name="message" rows={4} value={f.message} onChange={(e) => f.setMessage(e.target.value)} minLength={10} maxLength={1000} required disabled={busy} aria-invalid={!!fieldErrors.message} aria-describedby={fieldErrors.message ? "lk-message-err" : undefined} />
        {fieldErrors.message && <p className="field-error" id="lk-message-err">{fieldErrors.message}</p>}
      </div>
      {f.error && <p className="form-error" role="alert">{f.error}</p>}
      <div className="field--wide form-actions">
        <button type="submit" className="action" disabled={busy}>{busy ? "Sending" : "Send message"}</button>
      </div>
    </form>
  );
}

function Timeline({ entries, caption }: { entries: TimelineEntry[]; caption: string }) {
  return (
    <table className="tbl tbl--dates">
      <caption className="sr">{caption}</caption>
      <thead><tr><th scope="col">Dates</th><th scope="col">Role</th></tr></thead>
      <tbody>
        {entries.map((e) => (
          <tr key={e.org}>
            <td>{e.label}</td>
            <td><strong>{e.role}, {e.org}.</strong> {e.body}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Block({ id, side, wide, title, tag, lead, children }: {
  id: string; side: "left" | "right"; wide?: boolean; title: string; tag: string; lead: string; children: React.ReactNode;
}) {
  return (
    <section id={id} tabIndex={-1} className={`block block--${side}${wide ? " block--wide" : ""}`}>
      <div className="block-head">
        <h2 className="block-title">{title}</h2>
        <span className="lock-tag">{tag}</span>
      </div>
      <p className="block-lead">{lead}</p>
      <div className="block-gate">
        <div className="block-shutter" aria-hidden="true"><span>Locked</span></div>
        <div className="block-inner">{children}</div>
      </div>
    </section>
  );
}

const lockTag = (i: number) => `Lock ${LOCKS[i].n} of ${LOCKS.length}`;

export default function LockPage() {
  preload("/models/door.glb", { as: "fetch", crossOrigin: "anonymous" });
  const [active, setActive] = useState("");
  useEffect(() => {
    const ids = NAV.map((n) => n.id);
    const showing = new Set<string>();
    const obs = new IntersectionObserver((entries) => {
      for (const e of entries) { if (e.isIntersecting) showing.add(e.target.id); else showing.delete(e.target.id); }
      setActive(ids.find((id) => showing.has(id)) ?? "");
    }, { rootMargin: "-22% 0px -66% 0px", threshold: 0 });
    ids.forEach((id) => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <noscript>
        <style dangerouslySetInnerHTML={{ __html: ".content{margin-top:0!important}.nav-toggle{display:none!important}.form{display:none!important}" }} />
      </noscript>
      <a className="skip" href="#projects">Skip to the projects</a>
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
                <a className="link-quiet" href="#projects">See the projects <ArrowDown /></a>
              </div>
            </div>
            <div className="hero-right">
              <dl className="kv">
                <div><dt>Email</dt><dd><a href={`mailto:${person.email}`}>{person.email}</a></dd></div>
                <div><dt>GitHub</dt><dd><a href={person.github.url} target="_blank" rel="noreferrer">@{person.github.handle}</a></dd></div>
                <div><dt>LinkedIn</dt><dd><a href={person.linkedin.url} target="_blank" rel="noreferrer">{person.linkedin.handle}</a></dd></div>
                <div><dt>Looking for</dt><dd>Cyber security co-op</dd></div>
              </dl>
            </div>
          </header>

          <Block id="about" side="left" title="About" tag={lockTag(0)} lead="Getting the foundations right is most of the job.">
            <div className="notes">
              <p>
                I build websites and web apps end to end: the screens people use, and the API and
                database behind them. Most of the real work sits at the seams, where the frontend
                meets the API and the API meets the data.
              </p>
              <p>
                Since May 2026 this has been paid work. I maintain One North End&apos;s website and
                internal tools, and I co-run Dory Digital, where I build every client site from scratch.
              </p>
              <p>
                Cyber security is where I&apos;m headed. I don&apos;t have security work to show yet, so
                this page shows what I do have: shipped software and the habit of taking it apart to see how it fails.
              </p>
              <p>
                This page is part of the evidence: Next.js, hand-written CSS, a door modelled in Blender,
                and one Three.js scene driven by scroll position.
              </p>
            </div>
            <table className="tbl tbl--schedule">
              <caption>The door is defence in depth: five locks, one per section, and every one has to give before it opens.</caption>
              <thead><tr><th scope="col">Lock</th><th scope="col">Hardware</th><th scope="col">Stands for</th></tr></thead>
              <tbody>
                {LOCKS.map((l) => (
                  <tr key={l.n}>
                    <td>{l.n}</td><td>{l.name}</td><td><strong>{l.layer}.</strong> {l.layerNote}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Block>

          <Block id="projects" side="right" wide title="Projects" tag={lockTag(1)} lead="Three apps live, a fourth in progress.">
            <div className="figs">
              {projects.map((p) => {
                const live = p.status === "live" && p.href && p.image;
                return (
                  <figure key={p.id} className={live ? "fig" : "fig fig--prelim"}>
                    <figcaption className="fig-cap">
                      <div className="fig-head">
                        <h3 className="fig-title">{p.title}</h3>
                        {live ? (
                          <a className="fig-link" href={p.href} target="_blank" rel="noreferrer">Open site <ArrowOut /></a>
                        ) : (
                          <span className="fig-link fig-link--off">In progress, {p.year}</span>
                        )}
                      </div>
                      <p className="fig-summary">{p.summary}</p>
                      <p className="fig-body">{p.body}</p>
                      <p className="fig-stack">{p.stack.join(" · ")}</p>
                    </figcaption>
                    {live && (
                      <div className="fig-frame">
                        <a href={p.href} target="_blank" rel="noreferrer" tabIndex={-1} className="fig-views">
                          <Image src={p.image!.desktop} alt={`${p.title} on a desktop, ${p.image!.shows}`} width={1440} height={900} sizes="(max-width: 900px) 62vw, 44vw" />
                          <Image src={p.image!.mobile} alt={`${p.title} on a phone, ${p.image!.shows}`} width={780} height={1688} sizes="(max-width: 520px) 60vw, (max-width: 900px) 30vw, 14vw" />
                        </a>
                      </div>
                    )}
                  </figure>
                );
              })}
            </div>
          </Block>

          <Block id="skills" side="left" title="Skills" tag={lockTag(2)} lead="What I build with.">
            <table className="tbl tbl--skills">
              <caption className="sr">Skills, grouped</caption>
              <colgroup><col className="col-group" /><col /></colgroup>
              <tbody>
                {skills.map((g) => (
                  <tr key={g.title}>
                    <th scope="row">{g.title}</th>
                    <td>{g.items.join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Block>

          <Block id="experience" side="right" title="Experience" tag={lockTag(3)} lead="Where I've worked.">
            <Timeline entries={experience} caption="Work experience" />
          </Block>

          <Block id="education" side="left" title="Education" tag={lockTag(4)} lead="Where I've studied.">
            <Timeline entries={education} caption="Education" />
          </Block>

          <Block id="contact" side="right" title="Contact" tag="The door" lead="Hiring for a security co-op? Let's talk.">
            <noscript><p className="form-note">The form needs JavaScript. Email me at <a href={`mailto:${person.email}`}>{person.email}</a>.</p></noscript>
            <ContactForm />
            <dl className="kv kv--contact">
              <div><dt>Email</dt><dd><a href={`mailto:${person.email}`}>{person.email}</a></dd></div>
              <div><dt>GitHub</dt><dd><a href={person.github.url} target="_blank" rel="noreferrer">@{person.github.handle}</a></dd></div>
              <div><dt>LinkedIn</dt><dd><a href={person.linkedin.url} target="_blank" rel="noreferrer">{person.linkedin.handle}</a></dd></div>
            </dl>
          </Block>
        </main>

        <footer className="lock-footer">
          <span>{person.brand} · {person.name} · {person.city}</span>
          <span>Project captures taken 2026-11-05</span>
        </footer>
      </div>
    </>
  );
}
