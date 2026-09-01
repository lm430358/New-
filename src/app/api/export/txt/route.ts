import { z } from "zod";

const schema = z.object({ title: z.string().optional(), content: z.string() });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return new Response("Invalid request", { status: 400 });
  }
  const { title, content } = parsed.data;
  const text = title ? `${title}\n${"=".repeat(title.length)}\n\n${content}` : content;
  return new Response(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": "attachment; filename=content.txt",
    },
  });
}
