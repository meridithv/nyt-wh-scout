import { NextRequest, NextResponse } from "next/server";
import { parseISO, subDays, format as fmt } from "date-fns";
import { fetchOverview } from "@/lib/nyt";
import { parseAuthorBlob, authorMatches } from "@/lib/match";
import { statusTag, line } from "@/lib/format";
import { recordReport } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // avoid caching for uploads

export async function POST(req: NextRequest) {
  // Branch by content-type: JSON for live, multipart for pdf
  const ctype = req.headers.get("content-type") || "";
  if (ctype.startsWith("application/json")) {
    const body = await req.json().catch(() => ({}));
    if (String(body?.source || "") !== "live") {
      return NextResponse.json(
        { error: "unsupported source" },
        { status: 400 }
      );
    }
    return runLive(String(body?.authors ?? ""));
  } else if (ctype.startsWith("multipart/form-data")) {
    const form = await req.formData();
    if (String(form.get("source") || "") !== "pdf") {
      return NextResponse.json(
        { error: "unsupported source" },
        { status: 400 }
      );
    }
    const authorsBlob = String(form.get("authors") ?? "");
    const file = form.get("file");
    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: "missing file" }, { status: 400 });
    }
    const buf = Buffer.from(await file.arrayBuffer());
    return runPdf(buf, authorsBlob);
  }
  return NextResponse.json({ error: "bad request" }, { status: 400 });
}

async function runLive(authorsBlob: string) {
  console.log("mer, in runLive");
  const watch = parseAuthorBlob(authorsBlob);
  if (watch.length === 0)
    return NextResponse.json({ weekDate: null, entries: [] });

  const o = await fetchOverview();
  const weekDate = o.published_date || o.bestsellers_date || null;

  const matches: string[] = [];
  for (const lst of o.lists) {
    for (const b of lst.books) {
      const whoLine = b.author || b.contributor || "";
      const m = authorMatches(whoLine, watch);
      if (!m) continue;
      const tag =
        b.rank_last_week === 0
          ? "NEW THIS WEEK"
          : statusTag(b.weeks_on_list, b.rank_last_week, b.rank);
      matches.push(line(m.who, b.title, b.rank, lst.list_name, tag));
    }
  }
  const payload = { weekDate, count: matches.length, entries: matches };
  if (weekDate) await recordReport(weekDate, payload);
  return NextResponse.json(payload);
}

async function runPdf(pdfBuffer: Buffer, authorsBlob: string) {
  const { default: pdfParse } = await import("pdf-parse");
  const watch = parseAuthorBlob(authorsBlob);
  if (watch.length === 0)
    return NextResponse.json({ weekDate: null, entries: [] });

  const text = (await pdfParse(pdfBuffer)).text;
  console.log("mer, text is ", text);
  const weekDate = extractWeekDate(text); // string like '2025-05-04' or null
  const rows = parsePdfLists(text); // [{ category, rank, title, author }...]

  // Build a quick lookup of last week’s ranks using NYT overview for D-7.
  const prevDate = weekDate
    ? fmt(subDays(parseISO(weekDate), 7), "yyyy-MM-dd")
    : undefined;
  const prev = prevDate
    ? await fetchOverview(prevDate).catch(() => null)
    : null;
  const priorIndex = prev ? indexLastWeek(prev) : null;

  const matches: string[] = [];
  for (const row of rows) {
    const m = authorMatches(row.author, watch);
    if (!m) continue;

    let tag = "NEW THIS WEEK";
    if (priorIndex) {
      const last = priorIndex.get(key(row));
      if (last != null) {
        if (row.rank < last) tag = `UP FROM #${last} LAST WEEK`;
        else if (row.rank > last) tag = `DOWN FROM #${last} LAST WEEK`;
        else tag = `SAME AS LAST WEEK`;
      }
    }
    matches.push(line(m.who, row.title, row.rank, row.category, tag));
  }

  const payload = { weekDate, count: matches.length, entries: matches };
  if (weekDate) await recordReport(weekDate, payload);
  console.log("mer, payload is ", payload);
  return NextResponse.json(payload);
}

// Helpers

function extractWeekDate(text: string): string | null {
  const m = text.match(/\b([A-Z][a-z]+ \d{1,2}, \d{4})\b/);
  if (!m) return null;
  const d = new Date(m[1]);
  return isNaN(+d) ? null : d.toISOString().slice(0, 10);
}

type PdfRow = { category: string; rank: number; title: string; author: string };

const CATEGORY_HEADERS = [
  "Hardcover Fiction",
  "Hardcover Nonfiction",
  "Paperback Trade Fiction",
  "Paperback Nonfiction",
  "Combined Print & E-Book Fiction",
  "Combined Print & E-Book Nonfiction",
  "Advice, How-To & Miscellaneous",
  "Advice, How-to and Miscellaneous",
  "Middle Grade Hardcover",
  "Young Adult Hardcover",
  "Picture Books",
  "Series",
  "Audio Fiction",
  "Audio Nonfiction",
  "Audio Monthly Best Sellers",
  "Science",
  "Sports and Fitness",
  "Business",
];

function parsePdfLists(text: string): PdfRow[] {
  const lines = text.split(/\r?\n/);
  const out: PdfRow[] = [];
  let currentCategory = "";
  let pendingRank: number | null = null;
  let buffer: string[] = [];

  function flush() {
    if (pendingRank == null) return;
    const chunk = buffer.join(" ").replace(/\s+/g, " ").trim();
    const m = chunk.match(/(.+?),\s+by\s+(.+?)(?:\.|$)/i);
    if (m) {
      const title = tidyTitle(m[1]);
      const author = tidyAuthor(m[2]);
      out.push({
        category: currentCategory || "Unknown",
        rank: pendingRank,
        title,
        author,
      });
    }
    pendingRank = null;
    buffer = [];
  }

  for (const raw of lines) {
    const line = raw.replace(/\s+/g, " ").trim();

    if (!line) continue;

    if (
      CATEGORY_HEADERS.some((h) => line.toLowerCase().includes(h.toLowerCase()))
    ) {
      flush();
      const found = CATEGORY_HEADERS.find((h) =>
        line.toLowerCase().includes(h.toLowerCase())
      )!;
      currentCategory = found;
      continue;
    }

    if (/^\d{1,2}$/.test(line)) {
      flush();
      pendingRank = parseInt(line, 10);
      continue;
    }

    if (/^\d{1,2}\s+\d+$/.test(line)) {
      const r = parseInt(line.split(/\s+/)[0], 10);
      flush();
      pendingRank = r;
      continue;
    }

    if (pendingRank != null) buffer.push(line);
  }

  flush();
  return out;
}

function tidyTitle(s: string) {
  return s
    .replace(/\s+/g, " ")
    .replace(/\s+[:(].*$/, "")
    .trim()
    .toUpperCase();
}

function tidyAuthor(s: string) {
  return s
    .replace(/\(.*?\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function key(r: PdfRow) {
  return `${norm(r.category)}|${norm(r.title)}|${norm(r.author)}`;
}

function norm(s: string) {
  return s
    .normalize("NFKC")
    .replace(/[’‘“”]/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function indexLastWeek(o: {
  lists: {
    list_name: string;
    books: { title: string; author: string; rank: number }[];
  }[];
}) {
  const map = new Map<string, number>();
  for (const lst of o.lists) {
    for (const b of lst.books) {
      const r = {
        category: lst.list_name,
        rank: b.rank,
        title: tidyTitle(b.title),
        author: tidyAuthor(b.author || ""),
      };
      map.set(key(r), b.rank);
    }
  }
  return map;
}
