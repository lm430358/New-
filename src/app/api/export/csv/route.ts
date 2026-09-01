import { z } from "zod";

const schema = z.object({
  filename: z.string().optional(),
  rows: z.array(z.record(z.string(), z.union([z.string(), z.number()]))),
});

function escapeCsv(value: string | number): string {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success || parsed.data.rows.length === 0) {
    return new Response("Invalid request", { status: 400 });
  }
  const { rows } = parsed.data;
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escapeCsv(row[h] ?? "")).join(",")),
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=${parsed.data.filename ?? "calendar.csv"}`,
    },
  });
}
