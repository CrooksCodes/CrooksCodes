/**
 * The door and its five locks: one source of truth for the scene and the lock
 * schedule printed in the About section.
 * Units are drawing units (read them as centimetres).
 */

export const SCENE_SECTIONS = ["about", "projects", "skills", "experience", "education", "contact"] as const;
export type SceneSection = (typeof SCENE_SECTIONS)[number];

export const DOOR = { x0: 0.6, x1: 30, top: 22, bottom: -22, hinge: 30, thickness: 1.6, openDeg: 80, layer: "Defence in depth", layerNote: "No single lock is the point. The door is: every layer has to give before anything gets through." };
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
  { n: 1, name: "Barrel bolt", y: 16, section: "about", sectionLabel: "About", travel: "Slides 7 cm clear of the keep", layer: "Perimeter", layerNote: "The obvious lock. Firewalls, closed ports, rate limits, the things that keep a casual rattle out." },
  { n: 2, name: "Deadbolt", y: 8, section: "projects", sectionLabel: "Projects", travel: "Thumbturn 90°, bolt retracts 7 cm", layer: "Authentication", layerNote: "The one that needs a key. Hashed passwords, second factors, sessions that actually expire." },
  { n: 3, name: "Door chain", y: 0, section: "skills", sectionLabel: "Skills", travel: "Slides 7 cm to the wide end and drops", layer: "Least privilege", layerNote: "Lets the door open a crack, never all the way. Scoped tokens, roles, row-level security." },
  { n: 4, name: "Hasp and padlock", y: -8, section: "experience", sectionLabel: "Experience", travel: "Shackle lifts, padlock drops, hasp swings down 100°", layer: "Encryption", layerNote: "Get past the door and what's inside still can't be read. TLS, encrypted storage, secrets that never sit in a repo." },
  { n: 5, name: "Hook latch", y: -16, section: "education", sectionLabel: "Education", travel: "Hook swings 30° off its eye", layer: "Monitoring", layerNote: "Cheap and simple, and the first thing you hear when it fails. Logs, alerts, failed logins someone actually reads." },
];
