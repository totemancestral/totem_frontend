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

function archetypeFromTotem(nomTotem: string): string {
  const lower = nomTotem.toLowerCase();
  for (const [key, val] of Object.entries(TOTEM_TO_VISUAL)) {
    if (lower.includes(key)) return val;
  }
  return "lion";
}

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

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

async function generatePDF(
  commandeId: string,
  nomTotem: string,
  prenom: string,
  recit: string,
  imageBytes: Uint8Array | null,
  langue: "fr" | "en",
  orderNumber: number,
): Promise<Uint8Array> {
  const fontUrl = "https://mjiealkqjcqvlfrxdcif.supabase.co/storage/v1/object/public/totem-files/fonts/DancingScript-Regular.ttf";
  let fontBytes: Uint8Array;
  try {
    const resp = await fetch(fontUrl);
    fontBytes = new Uint8Array(await resp.arrayBuffer());
  } catch {
    fontBytes = new Uint8Array(0);
  }

  const pdfDoc = await PDFDocument.create();
  let dsFont;
  try { dsFont = await pdfDoc.embedFont(fontBytes); } catch { dsFont = await pdfDoc.embedFont(StandardFonts.TimesRoman); }
  const helv = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helvB = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const times = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesB = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  const A4W = 595.28, A4H = 841.89;
  const BG = rgb(0.96, 0.94, 0.88);
  const GOLD = rgb(0.79, 0.66, 0.30);
  const INK = rgb(0.17, 0.11, 0.05);
  const INK_L = rgb(0.35, 0.27, 0.15);
  const DARK = rgb(0.05, 0.05, 0.07);
  const m = 16, pm = 10;

  let embeddedImg: ReturnType<typeof pdfDoc.embedPng> | null = null;
  if (imageBytes) { try { embeddedImg = await pdfDoc.embedPng(imageBytes); } catch { try { embeddedImg = await pdfDoc.embedJpg(imageBytes); } catch {} } }

  // Cover page
  {
    const page = pdfDoc.addPage([A4W, A4H]);
    const { width, height } = page.getSize();
    page.drawRectangle({ x: 0, y: 0, width, height, color: DARK });
    page.drawRectangle({ x: m, y: m, width: width - 2*m, height: height - 2*m, color: BG });
    page.drawRectangle({ x: m, y: m, width: width - 2*m, height: height - 2*m, borderColor: GOLD, borderWidth: 2, color: undefined });
    page.drawRectangle({ x: m + pm, y: m + pm, width: width - 2*m - 2*pm, height: height - 2*m - 2*pm, color: BG });

    const tSize = 32;
    const title = "TOTEM ANCESTRAL";
    const tW = dsFont.widthOfTextAtSize(title, tSize);
    page.drawText(title, { x: (width - tW) / 2, y: height - 100, size: tSize, font: dsFont, color: INK });

    const sub = langue === "fr" ? "Decret royal de revelation symbolique" : "Royal decree of symbolic revelation";
    const sSize = 11;
    page.drawText(sub, { x: (width - dsFont.widthOfTextAtSize(sub, sSize)) / 2, y: height - 130, size: sSize, font: dsFont, color: INK_L });

    const ruleW = 80;
    page.drawRectangle({ x: (width - ruleW) / 2, y: height - 150, width: ruleW, height: 1.5, color: GOLD });

    let cy = height - 170;
    if (embeddedImg) {
      const maxW = 220, maxH = 220;
      const scale = Math.min(maxW / embeddedImg.width, maxH / embeddedImg.height);
      const dw = embeddedImg.width * scale, dh = embeddedImg.height * scale;
      page.drawImage(embeddedImg, { x: (width - dw) / 2, y: cy - dh, width: dw, height: dh });
      cy -= dh + 10;
    }

    const nSize = 18;
    const nW = dsFont.widthOfTextAtSize(nomTotem, nSize);
    page.drawText(nomTotem, { x: (width - nW) / 2, y: cy - 10, size: nSize, font: dsFont, color: INK });
    cy -= 30;

    const prep = langue === "fr" ? `Prepare pour ${prenom}` : `Prepared for ${prenom}`;
    const pSize = 12;
    page.drawText(prep, { x: (width - dsFont.widthOfTextAtSize(prep, pSize)) / 2, y: cy, size: pSize, font: dsFont, color: INK_L });

    const sealY = m + pm + 30;
    page.drawCircle({ x: width / 2, y: sealY + 30, size: 30, color: rgb(0.62, 0.11, 0.07) });
    page.drawCircle({ x: width / 2, y: sealY + 30, size: 26, borderColor: GOLD, borderWidth: 0.5, color: undefined });
    const taW = helvB.widthOfTextAtSize("TA", 18);
    page.drawText("TA", { x: (width - taW) / 2, y: sealY + 20, size: 18, font: helvB, color: rgb(1, 0.8, 0.43) });

    const serieStr = String(orderNumber).padStart(6, "0");
    const certT = langue === "fr" ? `Certifie authentique — N° ${serieStr}` : `Certified authentic — No. ${serieStr}`;
    page.drawText(certT, { x: (width - helv.widthOfTextAtSize(certT, 7)) / 2, y: m + 8, size: 7, font: helv, color: INK_L });
  }

  // Story / recit pages
  {
    const paragraphs = recit.split("\n").filter(p => p.trim()).map(p => p.trim());
    if (paragraphs.length > 0) {
      const page = pdfDoc.addPage([A4W, A4H]);
      const { width, height } = page.getSize();
      page.drawRectangle({ x: 0, y: 0, width, height, color: DARK });
      page.drawRectangle({ x: m, y: m, width: width - 2*m, height: height - 2*m, borderColor: GOLD, borderWidth: 2, color: undefined });
      page.drawRectangle({ x: m + pm, y: m + pm, width: width - 2*m - 2*pm, height: height - 2*m - 2*pm, color: BG });

      const marginX = 60, marginY = 75;
      const maxW = width - 2 * marginX;
      let curY = height - marginY;
      let currentPage = page;

      const pSize = 11, lineH = 19;
      for (const para of paragraphs) {
        curY -= 12;
        const words = para.split(" ");
        let line = "";
        for (const word of words) {
          const test = line ? line + " " + word : word;
          if (dsFont.widthOfTextAtSize(test, pSize) > maxW) {
            if (curY < marginY) {
              currentPage = pdfDoc.addPage([A4W, A4H]);
              const { width: w2, height: h2 } = currentPage.getSize();
              currentPage.drawRectangle({ x: 0, y: 0, width: w2, height: h2, color: DARK });
              currentPage.drawRectangle({ x: m, y: m, width: w2 - 2*m, height: h2 - 2*m, borderColor: GOLD, borderWidth: 2, color: undefined });
              currentPage.drawRectangle({ x: m + pm, y: m + pm, width: w2 - 2*m - 2*pm, height: h2 - 2*m - 2*pm, color: BG });
              curY = h2 - marginY;
            }
            currentPage.drawText(line, { x: marginX, y: curY, size: pSize, font: dsFont, color: INK });
            curY -= lineH;
            line = word;
          } else { line = test; }
        }
        if (line) {
          if (curY < marginY) {
            currentPage = pdfDoc.addPage([A4W, A4H]);
            const { width: w2, height: h2 } = currentPage.getSize();
            currentPage.drawRectangle({ x: 0, y: 0, width: w2, height: h2, color: DARK });
            currentPage.drawRectangle({ x: m, y: m, width: w2 - 2*m, height: h2 - 2*m, borderColor: GOLD, borderWidth: 2, color: undefined });
            currentPage.drawRectangle({ x: m + pm, y: m + pm, width: w2 - 2*m - 2*pm, height: h2 - 2*m - 2*pm, color: BG });
            curY = h2 - marginY;
          }
          currentPage.drawText(line, { x: marginX, y: curY, size: pSize, font: dsFont, color: INK });
          curY -= lineH;
        }
      }

      const { width: lastW, height: lastH } = currentPage.getSize();
      currentPage.drawCircle({ x: lastW / 2, y: 60, size: 20, color: rgb(0.62, 0.11, 0.07) });
      currentPage.drawCircle({ x: lastW / 2, y: 60, size: 17, borderColor: GOLD, borderWidth: 0.5, color: undefined });
      const taW2 = helvB.widthOfTextAtSize("TA", 12);
      currentPage.drawText("TA", { x: (lastW - taW2) / 2, y: 51, size: 12, font: helvB, color: rgb(1, 0.8, 0.43) });
      const sigT = "SENYCE PARTNERS";
      const sigW = dsFont.widthOfTextAtSize(sigT, 8);
      currentPage.drawText(sigT, { x: lastW - marginX - sigW, y: 35, size: 8, font: dsFont, color: INK_L });
    }
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

    page.drawCircle({ x: width / 2, y: cy - 30, size: 20, color: rgb(0.62, 0.11, 0.07) });
    page.drawCircle({ x: width / 2, y: cy - 30, size: 17, borderColor: GOLD, borderWidth: 0.5, color: undefined });
    page.drawText("TA", { x: (width - helvB.widthOfTextAtSize("TA", 12)) / 2, y: cy - 39, size: 12, font: helvB, color: rgb(1, 0.8, 0.43) });

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
    const { data: profile } = await supabase.from("profiles").select("email").eq("id", userId).single();
    if (!profile?.email) return;
    const email = profile.email as string;
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
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY") ?? ""}`,
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
    const langue = (cmd?.langue as string === "en" ? "en" : "fr") as "fr" | "en";
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

    // Step 1: Generate recit (story + totem name) via Claude
    console.log(`[${commandeId}] recit...`);
    const recitResult = await callEF("generate-recit", { commandeId });
    let recit = (recitResult?.recit as string) ?? "";
    let nomTotem = (recitResult?.nom_totem as string) ?? "";
    if (!recit) {
      const texteResult = await callEF("generate-texte", {
        prenom,
        reponses,
        archetypeId: inferredArchetypeId,
        langue,
      });
      recit = (texteResult?.texte as string) ?? (texteResult?.parchment_text as string) ?? "";
    }
    if (!nomTotem) {
      nomTotem = buildNomTotem(prenom, inferredArchetypeId, langue);
    }
    if (!recit) console.error(`[${commandeId}] recit generation returned empty`);

    // Step 2: Generate image
    console.log(`[${commandeId}] image...`);
    const archetypeId = archetypeFromTotem(nomTotem);
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
    const pdfBytes = await generatePDF(commandeId, nomTotem, prenom, recit, imageBytes, langue, orderNumber);

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
