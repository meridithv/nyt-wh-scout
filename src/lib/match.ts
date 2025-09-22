export type AuthorLine = { canonical: string; aliases: string[] };

export function parseAuthorBlob(blob: string): AuthorLine[] {
  return blob
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line
        .split("|")
        .map((s) => s.trim())
        .filter(Boolean);
      return { canonical: parts[0], aliases: parts.slice(1) };
    });
}

export function authorMatches(
  target: string,
  watch: AuthorLine[]
): { who: string } | null {
  const t = norm(target);
  for (const row of watch) {
    if (norm(row.canonical) === t) return { who: row.canonical };
    for (const alias of row.aliases)
      if (norm(alias) === t) return { who: row.canonical };
  }
  return null;
}

function norm(s: string) {
  return s.normalize("NFKC").replace(/\s+/g, " ").trim().toLowerCase();
}
