"use client";

import { useSyncExternalStore } from "react";

export const THEME_KEY = "cc-admin-theme";
export const ROOT_ID = "admin-root";

function root() {
  return document.getElementById(ROOT_ID);
}
function subscribe(onChange: () => void) {
  const el = root();
  if (!el) return () => {};
  const obs = new MutationObserver(onChange);
  obs.observe(el, { attributes: true, attributeFilter: ["data-theme"] });
  return () => obs.disconnect();
}
function getTheme(): "light" | "dark" {
  return root()?.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

/** Light and dark toggle, stored in localStorage. */
export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getTheme, () => "light" as const);
  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => {
        root()?.setAttribute("data-theme", next);
        try {
          localStorage.setItem(THEME_KEY, next);
        } catch {}
      }}
      aria-label={`Switch to ${next} mode`}
      className="grid size-9 place-items-center rounded-md text-fg-muted hover:bg-surface-2 hover:text-fg"
    >
      {theme === "dark" ? (
        <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
          <circle cx="10" cy="10" r="3.5" />
          <path d="M10 2.5v1.5M10 16v1.5M2.5 10H4M16 10h1.5M4.7 4.7l1 1M14.3 14.3l1 1M4.7 15.3l1-1M14.3 5.7l1-1" strokeLinecap="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 20 20" className="size-4" fill="currentColor" aria-hidden>
          <path d="M17.293 13.293A8 8 0 0 1 6.707 2.707a8.001 8.001 0 1 0 10.586 10.586Z" />
        </svg>
      )}
    </button>
  );
}

/** Runs before paint so a stored dark theme doesn't flash light. */
export const themeInitScript = `(function(){try{var r=document.getElementById(${JSON.stringify(ROOT_ID)});if(!r)return;var s=localStorage.getItem(${JSON.stringify(THEME_KEY)});r.setAttribute('data-theme',s==='dark'||(!s&&matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light');}catch(e){}})();`;
