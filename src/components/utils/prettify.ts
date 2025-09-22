// src/components/utils/prettify.ts
"use client";

// "Author, TITLE, #5 - Category (TAG)"
const LINE_RE = /^(.+?),\s+(.+?),\s+#(\d+)\s+-\s+(.+?)\s+\((.+)\)\s*$/;

export type Row = {
  printedAuthor: string;
  canonicalAuthor: string;
  title: string;
  rank: number;
  category: string;
  slug: string;
  tag: string;
};

export function groupByCanonicalThenTitle(lines: string[]) {
  const aliasMap = buildAliasMapFromCookie();
  const out: Record<string, Record<string, Row[]>> = {};
  for (const s of lines) {
    const p = parseLine(s);
    if (!p) continue;
    const canonical = toCanonical(p.author, aliasMap);
    const row: Row = {
      printedAuthor: p.author,
      canonicalAuthor: canonical,
      title: p.title,
      rank: p.rank,
      category: p.category,
      slug: slugify(p.category),
      tag: p.tag,
    };
    out[canonical] ??= {};
    out[canonical][row.title] ??= [];
    out[canonical][row.title].push(row);
  }
  return out;
}

function parseLine(s: string) {
  const m = s.match(LINE_RE);
  if (!m) return null;
  const [, author, title, rankStr, category, tag] = m;
  return { author, title, rank: parseInt(rankStr, 10), category, tag };
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type AliasMap = Record<string, string>;
function buildAliasMapFromCookie(): AliasMap {
  try {
    const raw = decodeURIComponent(
      (
        document.cookie
          .split("; ")
          .find((s) => s.startsWith("wh_authors_v1=")) || ""
      )
        .split("=")
        .slice(1)
        .join("=")
    );
    const map: AliasMap = {};
    for (const line of raw.split("\n")) {
      const parts = line
        .split("|")
        .map((s) => s.trim())
        .filter(Boolean);
      if (!parts.length) continue;
      const canonical = parts[0];
      for (const alias of parts) map[norm(alias)] = canonical;
    }
    return map;
  } catch {
    return {};
  }
}
function toCanonical(author: string, aliasMap: AliasMap) {
  return aliasMap[norm(author)] || author;
}
function norm(s: string) {
  return s.normalize("NFKC").replace(/\s+/g, " ").trim().toLowerCase();
}

const HEX_PALETTE = [
  "#2F5D50", // juniper green
  "#8A9A5B", // willow sage
  "#A37E2C", // antique ochre
  "#8B3A3A", // madder red
  "#5F7A55", // acanthus
  "#1F6F6E", // peacock teal
  "#446D8C", // woad blue
  "#1F3A5F", // prussian blue
  "#6D2E46", // claret
  "#8A4B22", // russet
  "#B07C5A", // terra cotta
  "#7A6C3A", // olive brass
  "#A3B18A", // lichen
  "#7A3B69", // damson plum
  "#C29A3A", // saffron oak
];

const LS_KEY = "wh_slug_hex_map_v1";

export function colorForSlug(slug: string): string {
  if (typeof window === "undefined") return HEX_PALETTE[0];
  const raw = localStorage.getItem(LS_KEY);
  const map: Record<string, string> = raw ? JSON.parse(raw) : {};
  if (!map[slug]) {
    const used = new Set(Object.values(map));
    const next =
      HEX_PALETTE.find((c) => !used.has(c)) ||
      HEX_PALETTE[Object.keys(map).length % HEX_PALETTE.length];
    map[slug] = next;
    localStorage.setItem(LS_KEY, JSON.stringify(map));
  }
  return map[slug];
}
