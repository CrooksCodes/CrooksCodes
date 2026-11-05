/**
 * The door and its five locks: one source of truth for the scene, the lock
 * schedule printed in the notes, the parts list, and the no-WebGL drawing.
 * Units are drawing units (read them as centimetres).
 */

export const SCENE_SECTIONS = ["about", "projects", "skills", "experience", "education", "contact"] as const;
export type SceneSection = (typeof SCENE_SECTIONS)[number];

export const DOOR = { x0: 0.6, x1: 30, top: 22, bottom: -22, hinge: 30, thickness: 1.6, openDeg: 58, layer: "Defence in depth", layerNote: "No single lock is the point. The door is: every layer has to give before anything gets through." };
export const JAMB = { x0: -14, x1: 0, top: 22, bottom: -22 };
export const SEAM = { x: 0.3, width: 0.6 };

export type Lock = {
  n: number;
  name: string;
  /** y of the mechanism's centreline on the door */
  y: number;
  /** the block of the sheet whose scroll releases it */
  section: Exclude<SceneSection, "contact">;
  sectionLabel: string;
  /** what the release looks like, for the schedule */
  travel: string;
  /** the security layer this lock stands for on the sheet */
  layer: string;
  layerNote: string;
};

export const LOCKS: Lock[] = [
  { n: 1, name: "Barrel bolt", y: 16, section: "about", sectionLabel: "Notes", travel: "Slides 7 cm clear of the keep", layer: "Perimeter", layerNote: "The obvious lock. Firewalls, closed ports, the things that keep a casual rattle out." },
  { n: 2, name: "Deadbolt", y: 8, section: "projects", sectionLabel: "Figures", travel: "Thumbturn 90°, bolt retracts 7 cm", layer: "Authentication", layerNote: "The one that needs a key. Passwords, second factors, sessions that actually expire." },
  { n: 3, name: "Door chain", y: 0, section: "skills", sectionLabel: "Parts list", travel: "Slides 7 cm to the wide end and drops", layer: "Least privilege", layerNote: "Lets the door open a crack, never all the way. Scoped tokens, roles, row-level security." },
  { n: 4, name: "Hasp and padlock", y: -8, section: "experience", sectionLabel: "Revisions", travel: "Shackle lifts, padlock drops, hasp swings down 80°", layer: "Encryption", layerNote: "A lock on top of a lock. TLS, hashed passwords, secrets that never sit in a repo." },
  { n: 5, name: "Hook latch", y: -16, section: "education", sectionLabel: "Revisions", travel: "Hook swings 30° off its eye", layer: "Monitoring", layerNote: "Cheap and simple, and the first thing you hear when it fails. Logs, alerts, rate limits." },
];

/** Balloons on the figure, in the parts list's own order. */
export const FIGURE_ITEMS = [
  ...LOCKS.map((l) => l.name),
  "Door leaf",
  "Seam",
];
