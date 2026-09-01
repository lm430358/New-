import { z } from "zod";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";

const schema = z.object({ title: z.string().optional(), content: z.string() });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return new Response("Invalid request", { status: 400 });
  }
  const { title, content } = parsed.data;

  const children: Paragraph[] = [];
  if (title) {
    children.push(new Paragraph({ text: title, heading: HeadingLevel.HEADING_1 }));
  }
  for (const line of content.split("\n")) {
    children.push(
      line.trim()
        ? new Paragraph({ children: [new TextRun(line)] })
        : new Paragraph({ children: [new TextRun("")] })
    );
  }

  const doc = new Document({ sections: [{ children }] });
  const buffer = await Packer.toBuffer(doc);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": "attachment; filename=content.docx",
    },
  });
}
