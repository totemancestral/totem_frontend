/**
 * Carte de partage du totem Junior, dessinée dans le navigateur.
 *
 * Le visuel est composé côté client (Canvas) à partir des données du totem :
 * aucun appel de génération d'image, donc aucun coût par vente et aucune
 * attente pour l'adolescent. Le PNG obtenu sert à la fois d'illustration
 * stockée avec l'œuvre et de visuel à publier sur les réseaux.
 */

export type JuniorCardInput = {
  animal: string;
  totemName: string;
  nomComplet: string;
  phrase: string;
  quality: string;
  orderNumber: number;
  locale: "fr" | "en";
};

/** Format portrait 1080×1350 : le ratio 4:5 d'Instagram, recadré sans perte par TikTok. */
const WIDTH = 1080;
const HEIGHT = 1350;

const GOLD = "#D8AD4D";
const GOLD_PALE = "#F6C865";
const NIGHT = "#0D0D1A";
const IVORY = "#F5F0E8";

export async function renderJuniorShareCard(input: JuniorCardInput): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas_unavailable");

  // Fond nuit profonde + halo doré, dans la palette du site.
  ctx.fillStyle = NIGHT;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  const halo = ctx.createRadialGradient(WIDTH / 2, HEIGHT * 0.42, 40, WIDTH / 2, HEIGHT * 0.42, 620);
  halo.addColorStop(0, "rgba(216,173,77,0.30)");
  halo.addColorStop(1, "rgba(216,173,77,0)");
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Filet doré intérieur.
  ctx.strokeStyle = "rgba(216,173,77,0.55)";
  ctx.lineWidth = 3;
  ctx.strokeRect(46, 46, WIDTH - 92, HEIGHT - 92);

  const logo = await loadImage("/assets/totem-logo.png").catch(() => null);
  if (logo) {
    const size = 210;
    ctx.globalAlpha = 0.92;
    ctx.drawImage(logo, WIDTH / 2 - size / 2, 150, size, size);
    ctx.globalAlpha = 1;
  }

  ctx.textAlign = "center";

  // Animal du totem : l'information mise en avant.
  ctx.fillStyle = GOLD;
  ctx.font = "600 34px Georgia, 'Times New Roman', serif";
  ctx.letterSpacing = "10px";
  ctx.fillText(input.animal.toUpperCase(), WIDTH / 2, 452);
  ctx.letterSpacing = "0px";

  ctx.fillStyle = IVORY;
  const nameLines = wrap(ctx, input.totemName.toUpperCase(), WIDTH - 220, "700 66px Georgia, serif");
  let y = 552;
  for (const line of nameLines.slice(0, 3)) {
    ctx.fillText(line, WIDTH / 2, y);
    y += 78;
  }

  ctx.strokeStyle = "rgba(216,173,77,0.6)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(WIDTH / 2 - 90, y + 16);
  ctx.lineTo(WIDTH / 2 + 90, y + 16);
  ctx.stroke();
  y += 84;

  ctx.fillStyle = "rgba(245,240,232,0.86)";
  for (const line of wrap(ctx, `« ${input.phrase} »`, WIDTH - 200, "italic 38px Georgia, serif").slice(0, 5)) {
    ctx.fillText(line, WIDTH / 2, y);
    y += 52;
  }

  ctx.fillStyle = GOLD_PALE;
  ctx.font = "500 30px Arial, Helvetica, sans-serif";
  ctx.fillText(input.nomComplet, WIDTH / 2, HEIGHT - 250);

  ctx.fillStyle = "rgba(245,240,232,0.5)";
  ctx.font = "26px Arial, Helvetica, sans-serif";
  ctx.fillText(
    `${input.quality} · N° ${String(input.orderNumber).padStart(6, "0")}`,
    WIDTH / 2,
    HEIGHT - 200,
  );

  ctx.fillStyle = GOLD;
  ctx.font = "600 28px Arial, Helvetica, sans-serif";
  ctx.letterSpacing = "6px";
  ctx.fillText("TOTEM-ANCESTRAL.COM", WIDTH / 2, HEIGHT - 120);
  ctx.letterSpacing = "0px";

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("canvas_encode_failed"))),
      "image/png",
    );
  });
}

/** Texte de témoignage prêt à publier, qui invite à faire le parcours. */
export function juniorShareText(input: JuniorCardInput): string {
  if (input.locale === "en") {
    return `I generated my ancestral totem, and it revealed I am ${input.totemName} — ${input.animal}, ${input.quality}.\n\n"${input.phrase}"\n\nDiscover yours on totem-ancestral.com`;
  }
  return `J'ai généré mon totem ancestral, et il m'a révélé que je suis ${input.totemName} — ${input.animal}, ${input.quality}.\n\n« ${input.phrase} »\n\nDécouvre le tien sur totem-ancestral.com`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("image_load_failed"));
    image.src = src;
  });
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, font: string) {
  ctx.font = font;
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}
