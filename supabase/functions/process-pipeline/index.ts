import { createClient } from "npm:@supabase/supabase-js@2";
import { PDFDocument, rgb, StandardFonts } from "npm:pdf-lib@1";

const SUPABASE_PROJECT_REF = "mjiealkqjcqvlfrxdcif";
const EF_BASE = `https://${SUPABASE_PROJECT_REF}.supabase.co/functions/v1`;
const DEFAULT_PRENOM = "Voyageur";
const MAX_AUDIO_TEXT_LENGTH = 1800;
const ARCHETYPE_KEYS = new Set([
  "lion",
  "lionne",
  "rhinoceros",
  "crocodile",
  "serpent",
  "dauphin",
  "elephant",
  "baobab",
  "zebre",
  "perroquet",
  "aigle",
  "leopard",
]);
const ARCHETYPE_LABELS: Record<string, { fr: string; en: string }> = {
  lion: { fr: "Lion", en: "Lion" },
  lionne: { fr: "Lionne", en: "Lioness" },
  rhinoceros: { fr: "Rhinoceros", en: "Rhinoceros" },
  crocodile: { fr: "Crocodile", en: "Crocodile" },
  serpent: { fr: "Serpent", en: "Serpent" },
  dauphin: { fr: "Dauphin", en: "Dolphin" },
  elephant: { fr: "Elephant", en: "Elephant" },
  baobab: { fr: "Baobab", en: "Baobab" },
  zebre: { fr: "Zebre", en: "Zebra" },
  perroquet: { fr: "Perroquet", en: "Parrot" },
  aigle: { fr: "Aigle", en: "Eagle" },
  leopard: { fr: "Leopard", en: "Leopard" },
};

// Map totem animal names (from generate-recit) to ANIMAL_VISUALS archetype keys
const TOTEM_TO_VISUAL: Record<string, string> = {
  lion: "lion", lionne: "lionne", panthère: "leopard", panthre: "leopard",
  guépard: "leopard", gupard: "leopard", hyène: "leopard", hyne: "leopard",
  léopard: "leopard", lopard: "leopard", rhinocéros: "rhinoceros", rhinoceros: "rhinoceros",
  crocodile: "crocodile", serpent: "serpent", python: "serpent", cobra: "serpent",
  vipère: "serpent", vipre: "serpent", boa: "serpent", mamba: "serpent",
  dauphin: "dauphin", éléphant: "elephant", elephant: "elephant", baobab: "baobab",
  zèbre: "zebre", zbre: "zebre", perroquet: "perroquet", aigle: "aigle",
  abeille: "aigle", faucon: "aigle", vautour: "aigle", hibou: "aigle",
  chouette: "aigle", corbeau: "aigle", grue: "aigle", cigogne: "aigle",
  héron: "aigle", heron: "aigle", ibis: "aigle", calao: "aigle", marabout: "aigle",
  autruche: "aigle", paon: "aigle", baleine: "dauphin", requin: "crocodile",
  tortue: "crocodile", varan: "crocodile", caméléon: "crocodile", cameon: "crocodile",
  gecko: "crocodile", hippocampe: "dauphin", phoque: "dauphin", lamantin: "dauphin",
  rat: "lion", buffle: "rhinoceros", hippopotame: "rhinoceros", girafe: "zebre",
  gorille: "lion", chimpanzé: "lion", chimpanz: "lion", babouin: "lion",
  singe: "lion", mandrill: "lion", antilope: "zebre", gazelle: "zebre",
  impala: "zebre", oryx: "zebre", koudou: "zebre", phacochère: "rhinoceros",
  phacochre: "rhinoceros", pangolin: "crocodile",
};

type StorySection = {
  title: string;
  paragraphs: string[];
};

function archetypeFromTotem(nomTotem: string): string {
  const lower = nomTotem.toLowerCase();
  for (const [key, val] of Object.entries(TOTEM_TO_VISUAL)) {
    if (lower.includes(key)) return val;
  }
  return "lion";
}

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

function normalizeLanguage(langue: unknown): "fr" | "en" {
  const raw = typeof langue === "string" ? langue.trim().toLowerCase() : "";
  if (!raw) return "fr";

  if (
    raw === "en" ||
    raw.startsWith("en-") ||
    raw === "english" ||
    raw === "anglais" ||
    raw === "anglaise"
  ) {
    return "en";
  }
  return "fr";
}

function sanitizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}|\r?\n/g)
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseStorySections(value: unknown): StorySection[] {
  if (!Array.isArray(value)) return [];

  const sections: StorySection[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const section = item as { title?: unknown; text?: unknown; paragraphs?: unknown };
    const title = sanitizeText(section.title);

    let paragraphs: string[] = [];
    if (Array.isArray(section.paragraphs)) {
      paragraphs = (section.paragraphs as unknown[])
        .map((p) => sanitizeText(p))
        .filter(Boolean);
    } else {
      const text = sanitizeText(section.text);
      if (text) paragraphs = splitParagraphs(text);
    }

    if (paragraphs.length > 0) {
      sections.push({ title, paragraphs });
    }
  }

  return sections;
}

function fallbackSectionsFromRecit(recit: string): StorySection[] {
  const paragraphs = splitParagraphs(recit);
  if (paragraphs.length === 0) return [];
  return [{ title: "", paragraphs }];
}

function collectFreeAnswers(reponses: Record<string, unknown>): string[] {
  const lines: string[] = [];
  for (const value of Object.values(reponses)) {
    if (!value || typeof value !== "object") continue;
    const answer = value as { field?: unknown };
    const field = sanitizeText(answer.field);
    if (field) lines.push(field);
  }
  return lines;
}

function buildFallbackRecit(
  prenom: string,
  nomTotem: string,
  reponses: Record<string, unknown>,
  langue: "fr" | "en",
): string {
  const lines = collectFreeAnswers(reponses);
  if (lines.length > 0) return lines.join("\n\n");

  if (langue === "fr") {
    return `${prenom} avance sous le signe de ${nomTotem}. Dans la mémoire des anciens, ce totem veille, protège et éclaire chaque pas du voyage initiatique.`;
  }
  return `${prenom} walks under the sign of ${nomTotem}. In ancestral memory, this totem watches over, protects, and illuminates each step of the initiatory journey.`;
}

function extractArchetypeFromAnswers(reponses: Record<string, unknown>): string {
  for (const value of Object.values(reponses)) {
    if (!value || typeof value !== "object") continue;
    const choice = (value as { choice?: unknown }).choice;
    if (typeof choice !== "string") continue;
    const normalized = choice.trim().toLowerCase();
    if (ARCHETYPE_KEYS.has(normalized)) return normalized;
  }
  return "lion";
}

function buildNomTotem(prenom: string, archetypeId: string, langue: "fr" | "en"): string {
  const key = ARCHETYPE_KEYS.has(archetypeId) ? archetypeId : "lion";
  const label = ARCHETYPE_LABELS[key]?.[langue] ?? ARCHETYPE_LABELS.lion[langue];
  const finalPrenom = prenom.trim() || DEFAULT_PRENOM;
  return `${finalPrenom} ${label}`;
}

function buildAudioScript(recit: string, langue: "fr" | "en"): string {
  const normalized = recit.replace(/\s+/g, " ").trim();
  if (!normalized) return langue === "fr" ? "Message ancestral." : "Ancestral message.";
  if (normalized.length <= MAX_AUDIO_TEXT_LENGTH) return normalized;
  return `${normalized.slice(0, MAX_AUDIO_TEXT_LENGTH).trimEnd()}...`;
}

async function callEF(name: string, body: unknown): Promise<Record<string, unknown> | null> {
  const secret = Deno.env.get("PIPELINE_INTERNAL_SECRET");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (secret) headers["x-pipeline-secret"] = secret;
  if (anonKey) headers["Authorization"] = `Bearer ${anonKey}`;

  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await sleep(1000 * attempt);
    try {
      const res = await fetch(`${EF_BASE}/${name}`, {
        method: "POST", headers, body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error(`${name} attempt ${attempt + 1} returned ${res.status}: ${text.slice(0, 300)}`);
        if (res.status < 500) return null;
        continue;
      }
      return await res.json() as Record<string, unknown>;
    } catch (e) {
      console.error(`${name} attempt ${attempt + 1} error:`, e);
    }
  }
  return null;
}

async function downloadImage(url: string): Promise<Uint8Array | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return new Uint8Array(await res.arrayBuffer());
  } catch { return null; }
}

let manuscriptFontCache: Uint8Array | null = null;
let parchmentTextureCache: Uint8Array | null = null;

async function loadBundledAsset(path: string): Promise<Uint8Array | null> {
  try {
    return await Deno.readFile(new URL(path, import.meta.url));
  } catch {
    return null;
  }
}

async function fetchAsset(url: string): Promise<Uint8Array | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return new Uint8Array(await response.arrayBuffer());
  } catch {
    return null;
  }
}

async function loadManuscriptFontBytes(): Promise<Uint8Array> {
  if (manuscriptFontCache) return manuscriptFontCache;

  const localCandidates = [
    "./MAKALO-Regular.otf",
    "./assets/MAKALO-Regular.otf",
  ];
  for (const path of localCandidates) {
    const bytes = await loadBundledAsset(path);
    if (bytes && bytes.length > 0) {
      manuscriptFontCache = bytes;
      return bytes;
    }
  }

  const remoteCandidates = [
    "https://mjiealkqjcqvlfrxdcif.supabase.co/storage/v1/object/public/totem-files/fonts/MAKALO-Regular.otf",
    "https://mjiealkqjcqvlfrxdcif.supabase.co/storage/v1/object/public/totem-files/fonts/DancingScript-Regular.ttf",
  ];
  for (const url of remoteCandidates) {
    const bytes = await fetchAsset(url);
    if (bytes && bytes.length > 0) {
      manuscriptFontCache = bytes;
      return bytes;
    }
  }

  manuscriptFontCache = new Uint8Array(0);
  return manuscriptFontCache;
}

async function loadParchmentTextureBytes(): Promise<Uint8Array | null> {
  if (parchmentTextureCache) return parchmentTextureCache;

  const localCandidates = [
    "./parchemin_ouvert.png",
    "./assets/parchemin_ouvert.png",
  ];
  for (const path of localCandidates) {
    const bytes = await loadBundledAsset(path);
    if (bytes && bytes.length > 0) {
      parchmentTextureCache = bytes;
      return bytes;
    }
  }

  return null;
}

function wrapText(text: string, font: { widthOfTextAtSize: (t: string, s: number) => number }, size: number, maxWidth: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines: string[] = [];
  let line = words[0];

  for (let i = 1; i < words.length; i++) {
    const candidate = `${line} ${words[i]}`;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      line = candidate;
    } else {
      lines.push(line);
      line = words[i];
    }
  }
  if (line) lines.push(line);
  return lines;
}

async function generatePDF(
  _commandeId: string,
  nomTotem: string,
  prenom: string,
  recit: string,
  imageBytes: Uint8Array | null,
  sections: StorySection[],
  langue: "fr" | "en",
  orderNumber: number,
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const fontBytes = await loadManuscriptFontBytes();
  const textureBytes = await loadParchmentTextureBytes();

  let dsFont;
  try { dsFont = await pdfDoc.embedFont(fontBytes); } catch { dsFont = await pdfDoc.embedFont(StandardFonts.TimesRoman); }

  const helv = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helvB = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const times = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesB = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  const A4W = 595.28, A4H = 841.89;
  const BG = rgb(0.97, 0.94, 0.88);
  const GOLD = rgb(0.79, 0.66, 0.30);
  const INK = rgb(0.17, 0.11, 0.05);
  const INK_L = rgb(0.35, 0.27, 0.15);
  const DARK = rgb(0.05, 0.05, 0.08);
  const m = 16, pm = 10;

  const labels = langue === "fr"
    ? {
      subtitle: "Decret royal de revelation symbolique",
      preparedFor: "Prepare pour",
      storyTitle: "Le Recit",
      sigilTitle: "Insigne",
      certLine: "Certifie authentique",
      certNo: "N°",
    }
    : {
      subtitle: "Royal decree of symbolic revelation",
      preparedFor: "Prepared for",
      storyTitle: "The Story",
      sigilTitle: "Sigil",
      certLine: "Certified authentic",
      certNo: "No.",
    };

  let embeddedImg: ReturnType<typeof pdfDoc.embedPng> | null = null;
  if (imageBytes) { try { embeddedImg = await pdfDoc.embedPng(imageBytes); } catch { try { embeddedImg = await pdfDoc.embedJpg(imageBytes); } catch {} } }

  let textureImg: ReturnType<typeof pdfDoc.embedPng> | null = null;
  if (textureBytes) {
    try {
      textureImg = await pdfDoc.embedPng(textureBytes);
    } catch {
      try {
        textureImg = await pdfDoc.embedJpg(textureBytes);
      } catch {
        textureImg = null;
      }
    }
  }

  function drawWaxSeal(
    page: ReturnType<typeof pdfDoc.addPage>,
    cx: number,
    cy: number,
    size: number,
  ) {
    page.drawCircle({ x: cx, y: cy, size, color: rgb(0.62, 0.11, 0.07) });
    page.drawCircle({ x: cx, y: cy, size: size * 0.86, borderColor: GOLD, borderWidth: 0.5, color: undefined });
    const taSize = Math.max(10, Math.round(size * 0.55));
    const taW = helvB.widthOfTextAtSize("TA", taSize);
    page.drawText("TA", {
      x: cx - taW / 2,
      y: cy - taSize * 0.35,
      size: taSize,
      font: helvB,
      color: rgb(1, 0.8, 0.43),
    });
  }

  function drawParchmentFrame(page: ReturnType<typeof pdfDoc.addPage>) {
    const { width, height } = page.getSize();
    page.drawRectangle({ x: 0, y: 0, width, height, color: DARK });
    page.drawRectangle({ x: m, y: m, width: width - 2 * m, height: height - 2 * m, borderColor: GOLD, borderWidth: 2, color: undefined });

    const innerX = m + pm;
    const innerY = m + pm;
    const innerW = width - 2 * m - 2 * pm;
    const innerH = height - 2 * m - 2 * pm;

    page.drawRectangle({ x: innerX, y: innerY, width: innerW, height: innerH, color: BG });
    if (textureImg) {
      page.drawImage(textureImg, { x: innerX, y: innerY, width: innerW, height: innerH, opacity: 0.88 });
    }

    return { width, height, innerX, innerY, innerW, innerH };
  }

  {
    const page = pdfDoc.addPage([A4W, A4H]);
    const { width, height, innerX, innerY, innerW, innerH } = drawParchmentFrame(page);

    const tSize = 32;
    const title = "TOTEM ANCESTRAL";
    const tW = dsFont.widthOfTextAtSize(title, tSize);
    const topY = innerY + innerH - 86;
    page.drawText(title, { x: (width - tW) / 2, y: topY, size: tSize, font: dsFont, color: INK });

    const sSize = 11;
    page.drawText(labels.subtitle, {
      x: (width - dsFont.widthOfTextAtSize(labels.subtitle, sSize)) / 2,
      y: topY - 30,
      size: sSize,
      font: dsFont,
      color: INK_L,
    });

    const ruleW = 80;
    page.drawRectangle({ x: (width - ruleW) / 2, y: topY - 48, width: ruleW, height: 1.5, color: GOLD });

    let cy = topY - 70;
    if (embeddedImg) {
      const maxW = 220, maxH = 220;
      const scale = Math.min(maxW / embeddedImg.width, maxH / embeddedImg.height);
      const dw = embeddedImg.width * scale, dh = embeddedImg.height * scale;
      page.drawImage(embeddedImg, { x: (width - dw) / 2, y: cy - dh, width: dw, height: dh });
      cy -= dh + 16;
    }

    const nSize = 24;
    const nW = dsFont.widthOfTextAtSize(nomTotem, nSize);
    page.drawText(nomTotem, { x: (width - nW) / 2, y: cy - 10, size: nSize, font: dsFont, color: INK });
    cy -= 40;
    const prep = `${labels.preparedFor} ${prenom}`;
    const pSize = 12;
    page.drawText(prep, { x: (width - dsFont.widthOfTextAtSize(prep, pSize)) / 2, y: cy, size: pSize, font: dsFont, color: INK_L });

    drawWaxSeal(page, width / 2, innerY + 58, 28);

    const serieStr = String(orderNumber).padStart(6, "0");
    const certT = `${labels.certLine} — ${labels.certNo} ${serieStr}`;
    page.drawText(certT, { x: (width - helv.widthOfTextAtSize(certT, 7)) / 2, y: m + 8, size: 7, font: helv, color: INK_L });
  }

  const storySections = sections.length > 0 ? sections : fallbackSectionsFromRecit(recit);
  const splitIndex = Math.ceil(storySections.length / 2);
  const storyGroups: StorySection[][] = [
    storySections.slice(0, splitIndex),
    storySections.slice(splitIndex),
  ];
  while (storyGroups.length < 2) storyGroups.push([]);

  for (let groupIndex = 0; groupIndex < storyGroups.length; groupIndex++) {
    const group = storyGroups[groupIndex];
    const isFirstStoryPage = groupIndex === 0;
    const isLastStoryPage = groupIndex === storyGroups.length - 1;

    const page = pdfDoc.addPage([A4W, A4H]);
    const { width, innerX, innerY, innerW, innerH } = drawParchmentFrame(page);
    const contentX = innerX + 54;
    const contentW = innerW - 108;
    const headerY = innerY + innerH - 70;
    const lineHeight = 16;
    const paragraphSize = 11;
    const titleSize = 19;
    const storyReserve = isLastStoryPage ? 170 : 110;
    let y = headerY;

    if (isFirstStoryPage) {
      const h = labels.storyTitle;
      page.drawText(h, {
        x: (width - dsFont.widthOfTextAtSize(h, 28)) / 2,
        y,
        size: 28,
        font: dsFont,
        color: INK,
      });
      page.drawRectangle({ x: (width - 100) / 2, y: y - 14, width: 100, height: 1.5, color: GOLD });
      y -= 40;
    } else {
      y -= 6;
    }

    for (const section of group) {
      if (section.title) {
        y -= 6;
        if (y <= innerY + storyReserve) break;
        page.drawText(section.title, {
          x: contentX,
          y,
          size: titleSize,
          font: dsFont,
          color: INK_L,
        });
        y -= 20;
      }

      for (const paragraph of section.paragraphs) {
        const lines = wrapText(paragraph, dsFont, paragraphSize, contentW);
        for (const line of lines) {
          if (y <= innerY + storyReserve) break;
          page.drawText(line, {
            x: contentX,
            y,
            size: paragraphSize,
            font: dsFont,
            color: INK,
          });
          y -= lineHeight;
        }
        if (y <= innerY + storyReserve) break;
        y -= 8;
      }

      if (y <= innerY + storyReserve) break;
      y -= 2;
    }

    if (isLastStoryPage) {
      const sigilY = innerY + 118;
      const sigilTitle = labels.sigilTitle;
      const stSize = 24;
      page.drawText(sigilTitle, {
        x: (width - dsFont.widthOfTextAtSize(sigilTitle, stSize)) / 2,
        y: sigilY,
        size: stSize,
        font: dsFont,
        color: INK,
      });
      page.drawRectangle({ x: (width - 90) / 2, y: sigilY - 12, width: 90, height: 1.2, color: GOLD });
      drawWaxSeal(page, width / 2, sigilY - 44, 27);
    } else {
      drawWaxSeal(page, width / 2, innerY + 62, 20);
    }

    const signature = "SENYCE PARTNERS";
    page.drawText(signature, {
      x: width - (innerX + 54) - dsFont.widthOfTextAtSize(signature, 8),
      y: innerY + 28,
      size: 8,
      font: dsFont,
      color: INK_L,
    });
  }

  // Certificate page
  {
    const page = pdfDoc.addPage([A4W, A4H]);
    const { width, height } = page.getSize();
    page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(1, 1, 1) });
    page.drawRectangle({ x: m, y: m, width: width - 2*m, height: height - 2*m, borderColor: GOLD, borderWidth: 2, color: undefined });
    page.drawRectangle({ x: m + 20, y: m + 16, width: width - 2*m - 40, height: height - 2*m - 32, borderColor: rgb(0.54, 0.32, 0.05), borderWidth: 0.5, color: undefined });

    const cTitle = langue === "fr" ? "CERTIFICAT D'AUTHENTICITE" : "CERTIFICATE OF AUTHENTICITY";
    page.drawText(cTitle, { x: (width - timesB.widthOfTextAtSize(cTitle, 14)) / 2, y: height - 70, size: 14, font: timesB, color: rgb(0.54, 0.32, 0.05) });
    const cSub = langue === "fr" ? "Oeuvre d'art numerique generee par intelligence artificielle" : "Digital artwork generated by artificial intelligence";
    page.drawText(cSub, { x: (width - times.widthOfTextAtSize(cSub, 9)) / 2, y: height - 88, size: 9, font: times, color: rgb(0.63, 0.39, 0.09) });

    let cy = height - 98;
    if (embeddedImg) {
      const maxW = 140, maxH = 140;
      const scale = Math.min(maxW / embeddedImg.width, maxH / embeddedImg.height);
      page.drawImage(embeddedImg, { x: (width - embeddedImg.width * scale) / 2, y: cy - embeddedImg.height * scale, width: embeddedImg.width * scale, height: embeddedImg.height * scale });
      cy -= embeddedImg.height * scale + 14;
    } else { cy -= 14; }

    page.drawRectangle({ x: width * 0.15, y: cy - 4, width: width * 0.7, height: 0.5, color: GOLD });

    drawWaxSeal(page, width / 2, cy - 30, 20);

    cy -= 60;
    const mX = 60, mW = width - 120;
    function wrap(t: string, size: number, font: typeof times, mw: number): string[] {
      const words = t.split(" "), lines: string[] = []; let cl = "";
      for (const w of words) {
        const test = cl ? cl + " " + w : w;
        if (font.widthOfTextAtSize(test, size) > mw) { lines.push(cl); cl = w; }
        else { cl = test; }
      }
      if (cl) lines.push(cl);
      return lines;
    }
    const line1 = langue === "fr"
      ? `Nous, SENYCE PARTNERS, certifions que l'oeuvre intitulee "${nomTotem}" a ete creee exclusivement pour ${prenom} a l'aide de notre pipeline d'intelligence artificielle Totem Ancestral.`
      : `We, SENYCE PARTNERS, certify that the artwork titled "${nomTotem}" was created exclusively for ${prenom} using our Totem Ancestral artificial intelligence pipeline.`;
    const line2 = langue === "fr"
      ? "Cette oeuvre unique, numerotee et scellee, est le fruit des reponses personnelles fournies par le destinataire lors de son parcours initiatique."
      : "This unique, numbered and sealed work is the fruit of the personal responses provided by the recipient during their initiatory journey.";

    for (const t of [line1, line2]) {
      for (const l of wrap(t, 9, times, mW)) { page.drawText(l, { x: mX, y: cy, size: 9, font: times, color: INK }); cy -= 13; }
      cy -= 4;
    }
    cy -= 8;
    const rows: [string, string][] = [
      [langue === "fr" ? "Oeuvre" : "Artwork", nomTotem],
      [langue === "fr" ? "Numero de serie" : "Serial Number", String(orderNumber).padStart(6, "0")],
      [langue === "fr" ? "Proprietaire" : "Owner", prenom],
      [langue === "fr" ? "Date" : "Date", new Date().toLocaleDateString(langue === "fr" ? "fr-FR" : "en-US")],
    ];
    for (const [l, v] of rows) {
      page.drawText(l, { x: mX, y: cy, size: 8, font: timesB, color: rgb(0.54, 0.32, 0.05) });
      page.drawText(v, { x: mX + 85, y: cy, size: 9, font: times, color: INK });
      cy -= 14;
    }
    const sigTxt = langue === "fr" ? "Pour SENYCE PARTNERS" : "For SENYCE PARTNERS";
    page.drawText(sigTxt, { x: width - mX - times.widthOfTextAtSize(sigTxt, 10), y: m + 20, size: 10, font: times, color: rgb(0.54, 0.32, 0.05) });
  }

  return await pdfDoc.save();
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) { hash = ((hash << 5) - hash) + str.charCodeAt(i); hash |= 0; }
  return Math.abs(hash);
}

async function sendEmail(supabase: ReturnType<typeof createClient>, commandeId: string, userId: string, prenom: string, nomTotem: string, langue: string, pdfUrl: string) {
  try {
    let email = "";
    const { data: profile } = await supabase.from("profiles").select("email").eq("id", userId).single();
    if (profile?.email && typeof profile.email === "string") {
      email = profile.email.trim();
    }

    if (!email) {
      try {
        const { data: authUser, error: authErr } = await supabase.auth.admin.getUserById(userId);
        if (authErr) {
          console.error(`[${commandeId}] auth.getUserById failed: ${authErr.message}`);
        } else {
          email = authUser?.user?.email?.trim() ?? "";
        }
      } catch (authError) {
        console.error(`[${commandeId}] auth email lookup error:`, authError);
      }
    }

    if (!email) {
      console.error(`[${commandeId}] sendEmail skipped: no email found for user ${userId}`);
      return;
    }

    const resendKey = Deno.env.get("RESEND_API_KEY") ?? "";
    if (!resendKey) {
      console.error(`[${commandeId}] sendEmail skipped: RESEND_API_KEY missing`);
      return;
    }

    const isFr = langue === "fr";

    const html = `<div style="font-family:Inter,Arial,sans-serif;background:#0c0e16;color:#e2e1ee;padding:32px">
      <div style="max-width:560px;margin:0 auto;border:1px solid rgba(216,173,77,.28);padding:28px;background:#12131b">
        <p style="letter-spacing:.22em;text-transform:uppercase;color:#d8ad4d;font-size:12px;margin:0 0 18px">TOTEM ANCESTRAL</p>
        <h1 style="font-size:28px;line-height:1.1;margin:0 0 18px;color:#fff">${isFr ? "Votre Totem est pret" : "Your Totem is ready"}</h1>
        <p style="color:#bab5a7;font-size:15px;line-height:1.6;margin:0 0 24px">
          ${isFr ? "Bonjour" : "Hello"} ${prenom},<br><br>
          ${isFr ? "Votre Totem Ancestral est arrive. Il vous attend dans votre espace personnel." : "Your Totem Ancestral has arrived. It awaits you in your personal space."}<br><br>
          <strong style="color:#d8ad4d">${nomTotem}</strong>
        </p>
        ${pdfUrl ? `<a href="${pdfUrl}" style="display:inline-block;background:#d8ad4d;color:#0c0e16;text-decoration:none;padding:12px 28px;font-size:14px;font-weight:600;margin-bottom:24px">${isFr ? "Telecharger le Parchemin" : "Download the Parchment"}</a>` : ""}
        <p style="color:#bab5a7;font-size:12px">SENYCE PARTNERS</p>
      </div>
    </div>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: "Totem Ancestral <totem@senycepartners.com>",
        to: [email],
        subject: isFr ? "Votre Totem Ancestral est pret" : "Your Totem Ancestral is ready",
        html,
      }),
    });
    if (!res.ok) console.error("Email send failed:", await res.text().catch(() => ""));
  } catch (e) { console.error("sendEmail error:", e); }
}

Deno.serve(async (req) => {
  let commandeId = "";
  try {
    const payload = await req.json() as { commandeId: string };
    commandeId = payload.commandeId;
    if (!commandeId) {
      return new Response(JSON.stringify({ error: "commandeId requis" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, serviceKey);
    const bucket = "totem-files";

    // Set commande to en_generation
    await supabase.from("commandes").update({ statut: "en_generation" }).eq("id", commandeId);
    await supabase.from("oeuvres").update({ statut: "en_cours" }).eq("commande_id", commandeId);

    // Lookup commande data: prenom, langue, reponses
    const { data: cmd } = await supabase.from("commandes").select("user_id, langue, reponses_id").eq("id", commandeId).single();
    const langue = normalizeLanguage(cmd?.langue);
    let prenom = "";
    if (cmd?.user_id) {
      const { data: profile } = await supabase.from("profiles").select("prenom").eq("id", cmd.user_id).single();
      prenom = (profile?.prenom as string) ?? "";
    }
    if (!prenom) prenom = DEFAULT_PRENOM;

    let reponses: Record<string, unknown> = {};
    if (cmd?.reponses_id) {
      const { data: rep } = await supabase.from("reponses_parcours").select("reponses").eq("id", cmd.reponses_id).maybeSingle();
      if (rep?.reponses && typeof rep.reponses === "object") {
        reponses = rep.reponses as Record<string, unknown>;
      }
    } else if (cmd?.user_id) {
      const { data: rep } = await supabase
        .from("reponses_parcours")
        .select("reponses")
        .eq("user_id", cmd.user_id)
        .eq("termine", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (rep?.reponses && typeof rep.reponses === "object") {
        reponses = rep.reponses as Record<string, unknown>;
      }
    }
    const inferredArchetypeId = extractArchetypeFromAnswers(reponses);

    // Step 1: Generate recit (story + sections) with explicit language
    console.log(`[${commandeId}] recit...`);
    const texteResult = await callEF("generate-texte", {
      prenom,
      reponses,
      archetypeId: inferredArchetypeId,
      langue,
    });
    let recit = sanitizeText(texteResult?.texte) || sanitizeText(texteResult?.parchment_text);
    let storySections = parseStorySections(texteResult?.sections);

    // Legacy generator kept for naming fallback compatibility.
    const recitResult = await callEF("generate-recit", { commandeId, langue });
    let nomTotem = sanitizeText(recitResult?.nom_totem);
    if (!recit) recit = sanitizeText(recitResult?.recit);

    if (!nomTotem) {
      nomTotem = buildNomTotem(prenom, inferredArchetypeId, langue);
    }
    if (!recit) {
      recit = buildFallbackRecit(prenom, nomTotem, reponses, langue);
    }
    if (storySections.length === 0) {
      storySections = fallbackSectionsFromRecit(recit);
    }
    if (!recit) console.error(`[${commandeId}] recit generation returned empty`);

    // Step 2: Generate image
    console.log(`[${commandeId}] image...`);
    const archetypeId = ARCHETYPE_KEYS.has(inferredArchetypeId)
      ? inferredArchetypeId
      : archetypeFromTotem(nomTotem);
    const seed = commandeId.replace(/-/g, "").slice(0, 12);
    let imageBytes: Uint8Array | null = null;
    const imgEF = await callEF("generate-image", { archetypeId, langue, seed });
    const imgUrl = (imgEF?.imageUrl as string) ?? "";
    const imgB64 = (imgEF?.b64 as string) ?? "";
    let finalImageUrl = imgUrl;
    if (imgUrl) {
      try {
        const resp = await fetch(imgUrl);
        if (resp.ok) imageBytes = new Uint8Array(await resp.arrayBuffer());
      } catch (e) { console.error("image download error:", e); }
    } else if (imgB64) {
      try {
        const decoded = atob(imgB64.replace(/\s/g, ""));
        imageBytes = new Uint8Array(decoded.length);
        for (let i = 0; i < decoded.length; i++) imageBytes[i] = decoded.charCodeAt(i);
      } catch (e) {
        console.error(`[${commandeId}] image b64 decode failed:`, e);
      }
    }

    // Step 3: Generate audio
    console.log(`[${commandeId}] audio...`);
    const audioScript = buildAudioScript(recit, langue);
    if (audioScript.length < recit.length) {
      console.log(`[${commandeId}] audio script truncated to ${audioScript.length} chars`);
    }
    const audioResult = await callEF("generate-audio", { prenom, texte: audioScript, archetypeId: "A", langue });
    const audioUrl = (audioResult?.audioUrl as string) ?? "";

    // Step 4: Generate PDF
    console.log(`[${commandeId}] pdf...`);
    const orderNumber = (hashCode(commandeId) % 999999) + 1;
    const pdfBytes = await generatePDF(
      commandeId,
      nomTotem,
      prenom,
      recit,
      imageBytes,
      storySections,
      langue,
      orderNumber,
    );

    // Step 5: Upload to Supabase Storage
    console.log(`[${commandeId}] upload...`);
    let pdfUrl = "", r2AudioUrl = "";

    try {
      const { error: pdfErr } = await supabase.storage.from(bucket).upload(
        `totems/${commandeId}/parchemin.pdf`, pdfBytes, { contentType: "application/pdf", upsert: true },
      );
      if (!pdfErr) {
        const { data: pub } = supabase.storage.from(bucket).getPublicUrl(`totems/${commandeId}/parchemin.pdf`);
        pdfUrl = pub?.publicUrl ?? "";
      }
    } catch (e) { console.error("PDF upload error:", e); }

    try {
      if (!finalImageUrl && imageBytes) {
        const { error: imgErr } = await supabase.storage.from(bucket).upload(
          `totems/${commandeId}/image.png`, imageBytes, { contentType: "image/png", upsert: true },
        );
        if (imgErr) {
          console.error(`[${commandeId}] image upload failed: ${imgErr.message}`);
        } else {
          const { data: pub } = supabase.storage.from(bucket).getPublicUrl(`totems/${commandeId}/image.png`);
          finalImageUrl = pub?.publicUrl ?? "";
        }
      }
    } catch (e) { console.error("Image upload error:", e); }

    try {
      if (audioUrl) {
        const base64Match = audioUrl.match(/^data:audio\/[a-z0-9.+-]+;base64,([\s\S]+)$/i);
        if (!base64Match) {
          console.error(`[${commandeId}] audio data URL format not supported`);
        } else {
          const audioBytes = Uint8Array.from(atob(base64Match[1].replace(/\s/g, "")), c => c.charCodeAt(0));
          const { error: audioErr } = await supabase.storage.from(bucket).upload(
            `totems/${commandeId}/audio.mp3`, audioBytes, { contentType: "audio/mpeg", upsert: true },
          );
          if (audioErr) {
            console.error(`[${commandeId}] audio upload failed: ${audioErr.message}`);
          } else {
            const { data: pub } = supabase.storage.from(bucket).getPublicUrl(`totems/${commandeId}/audio.mp3`);
            r2AudioUrl = pub?.publicUrl ?? "";
          }
        }
      }
    } catch (e) { console.error("Audio upload error:", e); }

    // Step 6: Update DB
    console.log(`[${commandeId}] finalize...`);
    const hasRecit = !!recit;
    const finalStatut = hasRecit && pdfUrl ? "livree" : "erreur";

    await supabase.from("commandes").update({ statut: finalStatut }).eq("id", commandeId);
    await supabase.from("oeuvres").update({
      statut: finalStatut,
      nom_totem: nomTotem || null,
      image_url: finalImageUrl || null,
      audio_url: r2AudioUrl || null,
      pdf_url: pdfUrl || null,
      numero_serie: String(orderNumber).padStart(6, "0"),
      recit: recit || null,
      prenom: prenom || null,
    }).eq("commande_id", commandeId);

    // Step 7: Email
    const { data: emailCmd } = await supabase.from("commandes").select("user_id").eq("id", commandeId).single();
    if (emailCmd?.user_id && pdfUrl) {
      await sendEmail(supabase, commandeId, emailCmd.user_id as string, prenom, nomTotem, langue, pdfUrl);
    }

    return new Response(JSON.stringify({ success: true, statut: finalStatut }), {
      status: 200, headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("process-pipeline error:", message);
    if (commandeId) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
        const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
        const supabase = createClient(supabaseUrl, serviceKey);
        await supabase.from("commandes").update({ statut: "erreur" }).eq("id", commandeId);
        await supabase.from("oeuvres").update({ statut: "erreur" }).eq("commande_id", commandeId);
      } catch {
        // noop
      }
    }
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }
});
