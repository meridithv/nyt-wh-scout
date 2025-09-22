// src/components/ResultsView.tsx
"use client";
import { groupByCanonicalThenTitle, colorForSlug } from "./utils/prettify";

export default function ResultsView({
  week,
  lines,
}: {
  week: string | null;
  lines: string[];
}) {
  const grouped = groupByCanonicalThenTitle(lines);

  return (
    <section className="space-y-10 w-full rounded-lg p-3 text-sm block bg-black/70 text-white placeholder-white/60 border border-white/20 outline-none">
      {week && <div className="text-sm text-neutral-100">Week: {week}</div>}
      {Object.keys(grouped).length === 0 ? (
        <div>
          <hr />
        </div>
      ) : (
        Object.entries(grouped).map(([canonical, byTitle]) => (
          <div key={canonical} className="space-y-2">
            <div className="text-lg text-neutral-50 text-right font-display">
              {canonical.toUpperCase()}
            </div>
            <hr />
            <div className="space-y-1">
              {Object.entries(byTitle).map(([title, rows]) => (
                <div key={title} className="space-y-1">
                  {rows.map((r, i) => (
                    <div
                      key={i}
                      className="text-sm"
                      style={{ color: colorForSlug(r.slug) }}
                    >
                      <div>
                        <b>{title}</b>
                        {differs(r.printedAuthor, canonical)
                          ? ` (as ${r.printedAuthor})`
                          : ""}
                        , #{r.rank} - <i>{r.category}</i>
                      </div>
                      <div className="text-[.6rem] text-neutral-200">
                        {r.tag}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </section>
  );
}

function differs(a: string, b: string) {
  return a.trim().toLowerCase() !== b.trim().toLowerCase();
}
