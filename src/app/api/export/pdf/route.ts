import { z } from "zod";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const schema = z.object({ title: z.string().optional(), content: z.string() });

const PAGE_WIDTH = 612; // 8.5in
const PAGE_HEIGHT = 792; // 11in
const MARGIN = 56;
const BODY_SIZE = 11;
const TITLE_SIZE = 18;
const LINE_HEIGHT = 15;

function wrapLine(text: string, maxWidth: number, font: import("pdf-lib").PDFFont, size: number): string[] {
  if (!text) return [""];
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
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

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  function newPageIfNeeded(needed: number) {
    if (y - needed < MARGIN) {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }
  }

  if (title) {
    for (const line of wrapLine(title, maxWidth, boldFont, TITLE_SIZE)) {
      newPageIfNeeded(TITLE_SIZE + 6);
      page.drawText(line, { x: MARGIN, y, size: TITLE_SIZE, font: boldFont, color: rgb(0.09, 0.09, 0.12) });
      y -= TITLE_SIZE + 6;
    }
    y -= 10;
  }

  for (const paragraph of content.split("\n")) {
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
