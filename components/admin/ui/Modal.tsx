"use client";

import { useEffect, useId, useRef } from "react";
import { cn } from "@/lib/admin/cn";

/** Native <dialog>: focus is trapped and restored, and Escape closes it. */
export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={cn(
        "m-auto w-[calc(100%-2rem)] max-w-lg rounded-xl border border-border bg-surface p-0 text-fg shadow-xl",
        "backdrop:bg-black/40 backdrop:backdrop-blur-sm",
        className,
      )}
    >
      {open && (
        <>
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <h2 id={titleId} className="text-sm font-semibold text-fg">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="grid size-7 place-items-center rounded-md text-fg-muted hover:bg-surface-2 hover:text-fg"
            >
              <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="px-5 py-4">{children}</div>
        </>
      )}
    </dialog>
  );
}
