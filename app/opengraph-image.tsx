import { OG_ALT, OG_SIZE, renderOgCard } from "./_shared/ogCard";

export const alt = OG_ALT;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgCard();
}
