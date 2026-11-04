"use client";

import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { useEffect, useState, useSyncExternalStore } from "react";

const subscribeNoop = () => () => {};

export function Cursor() {
  const reduce = useReducedMotion();
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const [label, setLabel] = useState("");
  const [showRing, setShowRing] = useState(false);
  const [visible, setVisible] = useState(false);

  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const sx = useSpring(x, { stiffness: 520, damping: 42, mass: 0.35 });
  const sy = useSpring(y, { stiffness: 520, damping: 42, mass: 0.35 });

  useEffect(() => {
    if (!mounted) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
    };

    const onOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement | null)?.closest("[data-cursor]") as HTMLElement | null;
      if (target) {
        setLabel((target.getAttribute("data-cursor") || "").toUpperCase());
        setShowRing(target.hasAttribute("data-cursor-ring"));
      }
    };

    const onOut = (e: MouseEvent) => {
      const from = (e.target as HTMLElement | null)?.closest("[data-cursor]") as HTMLElement | null;
      const to = (e.relatedTarget as HTMLElement | null)?.closest?.("[data-cursor]") as HTMLElement | null;
      if (from && !to) {
        setLabel("");
        setShowRing(false);
      }
    };

    const onDocLeave = () => setVisible(false);
    const onDocEnter = () => setVisible(true);
    const onBlur = () => setVisible(false);
    const onFocus = () => setVisible(true);

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    document.documentElement.addEventListener("mouseleave", onDocLeave);
    document.documentElement.addEventListener("mouseenter", onDocEnter);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      document.documentElement.removeEventListener("mouseleave", onDocLeave);
      document.documentElement.removeEventListener("mouseenter", onDocEnter);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
    };
  }, [mounted, x, y]);

  const ringLabel = label || "VIEW";

  if (!mounted) return null;

  return (
    <>
      <motion.div
        className="cursor-pill"
        style={{ x: sx, y: sy }}
        animate={{
          opacity: visible ? (label ? 1 : 0.9) : 0,
          scale: label ? 1 : 0.22,
        }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      >
        {label || "•"}
      </motion.div>

      <motion.div
        className="cursor-ring"
        style={{ x: sx, y: sy }}
        animate={{
          opacity: visible && showRing ? 1 : 0,
          scale: visible && showRing ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <svg viewBox="0 0 88 88">
          <defs>
            <path id="ring-path" d="M 44,44 m -32,0 a 32,32 0 1,1 64,0 a 32,32 0 1,1 -64,0" />
          </defs>
          <motion.g
            animate={reduce ? {} : { rotate: 360 }}
            transition={reduce ? { duration: 0 } : { duration: 6, ease: "linear", repeat: Infinity }}
          >
            <text>
              <textPath href="#ring-path" startOffset="0%">
                {`● ${ringLabel} ● ${ringLabel} ● ${ringLabel} ● ${ringLabel}`}
              </textPath>
            </text>
          </motion.g>
          <circle cx="44" cy="44" r="3" fill="var(--accent)" />
        </svg>
      </motion.div>
    </>
  );
}


// ── Grain overlay ─────────────────────────────────────────────────────────────
export function Grain() {
  return (
    <div className="grain-overlay" aria-hidden="true">
      <svg className="grain-svg">
        <filter id="grain-filter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain-filter)" />
      </svg>
    </div>
  );
}

