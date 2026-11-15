import sharp from "sharp";

function escapeXml(text: string) {
  return text.replace(/[<>&"']/g, char => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[char]!);
}

/** Rasterize the signature into the reduced copy, never send the original URL. */
export async function createShareImages(input: Buffer, name: string, lang = "fr") {
  const resized = await sharp(input, { limitInputPixels: 40_000_000 })
    .rotate().resize({ width: 800, height: 900, fit: "inside", withoutEnlargement: true })
    .toBuffer({ resolveWithObject: true });
  const { width, height } = resized.info;
  const label = escapeXml(lang === "en" ? `${name}’s totem · Totem Ancestral` : `Totem de ${name} · Totem Ancestral`);
  const fontSize = Math.max(12, Math.min(27, width / (name.length + 29) * 1.7));
  const watermark = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <g transform="rotate(-22 ${width / 2} ${height / 2})">
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
        font-family="sans-serif" font-size="${fontSize}" fill="#f0e3c2" fill-opacity="0.48"
        stroke="#171323" stroke-opacity="0.25" stroke-width="0.6">${label}</text>
    </g></svg>`);
  const preview = await sharp(resized.data).composite([{ input: watermark }]).jpeg({ quality: 68 }).toBuffer();
  // Contain preserves portrait artwork inside the landscape social card.
  const social = await sharp(preview).resize(1200, 630, {
    fit: "contain", background: "#0d0c18",
  }).jpeg({ quality: 75 }).toBuffer();
  return { preview: preview.toString("base64"), social: social.toString("base64") };
}
