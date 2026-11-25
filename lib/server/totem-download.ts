import sharp, { type OverlayOptions } from "sharp";

const background = "#0d0d1b";
const escapeMarkup = (value: string) => value.replace(/[<>&"']/g, char => ({
  "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;",
})[char]!);

/** Compose the existing artwork and its ancestral name; no AI call or public copy. */
export async function createTotemDownload(input: Buffer, ancestralName: string): Promise<Buffer> {
  const name = ancestralName.replace(/\s+/g, " ").trim();
  if (!name || name.length > 500) throw new Error("Invalid ancestral name");
  const portrait = await sharp(input, { limitInputPixels: 40_000_000 })
    .rotate().resize(1080, 1160, { fit: "contain", background }).png().toBuffer();
  const comma = name.indexOf(",");
  const parts = comma > 0 && comma < name.length - 1
    ? [name.slice(0, comma + 1), name.slice(comma + 1).trim()] : [name];
  const layers: OverlayOptions[] = [{ input: portrait, left: 60, top: 40 }];
  const rule = Buffer.from('<svg width="280" height="3"><path d="M0 1.5H280" stroke="#c9a84c" stroke-width="3"/></svg>');
  layers.push({ input: rule, left: 460, top: 1230 });
  for (const [index, part] of parts.entries()) {
    const { data, info } = await sharp({ text: {
      text: `<span foreground="#f6edda">${escapeMarkup(part)}</span>`,
      font: `serif ${parts.length === 1 ? 64 : index === 0 ? 80 : 54}`,
      width: 1040, height: parts.length === 1 ? 225 : 110,
      align: "centre", wrap: "word-char", rgba: true,
    } }).png().toBuffer({ resolveWithObject: true });
    layers.push({ input: data, left: Math.floor((1200 - info.width) / 2),
      top: parts.length === 1 ? 1280 + Math.floor((225 - info.height) / 2) : 1280 + index * 125 });
  }
  return sharp({ create: { width: 1200, height: 1600, channels: 3, background } })
    .composite(layers).png().toBuffer();
}
