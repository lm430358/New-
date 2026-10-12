import { z } from "zod";
import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";

const schema = z.object({ title: z.string().optional(), content: z.string() });

const PAGE_WIDTH = 612; // 8.5in
const PAGE_HEIGHT = 792; // 11in
const MARGIN = 56;
const BODY_SIZE = 11;
const TITLE_SIZE = 18;
const LINE_HEIGHT = 15;

// The built-in PDF fonts only cover WinAnsi (basic Latin). Generated content often has
// emoji and arrows, which make pdf-lib throw, so map the common ones and drop the rest.
const REPLACEMENTS: Record<string, string> = {
  "→": "->", "←": "<-", "⇒": "=>", "✓": "v", "✔": "v", "✅": "v", "❌": "x", "✗": "x",
  "★": "*", "⭐": "*", "\t": "    ",
};

function toDrawable(text: string, supported: Set<number>): string {
  let out = "";
  for (const ch of text) {
    const mapped = REPLACEMENTS[ch] ?? ch;
    for (const c of mapped) {
      if (supported.has(c.codePointAt(0)!)) out += c;
    }
  }
  // Dropping an emoji can leave doubled spaces behind.
  return out.replace(/ {2,}/g, " ").trimEnd();
}

function wrapLine(text: string, maxWidth: number, font: PDFFont, size: number): string[] {
  if (!text) return [""];
  const fits = (s: string) => font.widthOfTextAtSize(s, size) <= maxWidth;
  const lines: string[] = [];
  let current = "";
  for (let word of text.split(" ")) {
    const candidate = current ? `${current} ${word}` : word;
    if (fits(candidate)) {
      current = candidate;
      continue;
    }
    if (current) lines.push(current);
    // A single word wider than the page (e.g. a long URL) is hard-broken.
    while (!fits(word)) {
      let cut = word.length - 1;
      while (cut > 1 && !fits(word.slice(0, cut))) cut--;
      lines.push(word.slice(0, cut));
      word = word.slice(cut);
    }
    current = word;
  }
  if (current) lines.push(current);
  return lines;
}

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return new Response("Invalid request", { status: 400 });
  }
  const { title, content } = parsed.data;

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const maxWidth = PAGE_WIDTH - MARGIN * 2;
  // Helvetica and Helvetica-Bold share the WinAnsi character set.
  const supported = new Set(font.getCharacterSet());

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  function newPageIfNeeded(needed: number) {
    if (y - needed < MARGIN) {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }
  }

  if (title) {
    for (const line of wrapLine(toDrawable(title, supported), maxWidth, boldFont, TITLE_SIZE)) {
      newPageIfNeeded(TITLE_SIZE + 6);
      page.drawText(line, { x: MARGIN, y, size: TITLE_SIZE, font: boldFont, color: rgb(0.09, 0.09, 0.12) });
      y -= TITLE_SIZE + 6;
    }
    y -= 10;
  }

  for (const rawParagraph of content.replace(/\r\n?/g, "\n").split("\n")) {
    const paragraph = toDrawable(rawParagraph, supported);
    if (!paragraph.trim()) {
      y -= LINE_HEIGHT;
      continue;
    }
    for (const line of wrapLine(paragraph, maxWidth, font, BODY_SIZE)) {
      newPageIfNeeded(LINE_HEIGHT);
      page.drawText(line, { x: MARGIN, y, size: BODY_SIZE, font, color: rgb(0.12, 0.12, 0.15) });
      y -= LINE_HEIGHT;
    }
  }

  const bytes = await pdfDoc.save();

  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=content.pdf",
    },
  });
}
