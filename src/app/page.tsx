"use client";
import { useState } from "react";
import Image from "next/image";
import AuthorInput from "@/components/AuthorInput";
import Results from "@/components/Results";
import PdfUpload from "@/components/PdfUpload";
import AgencyAuthors from "@/components/AgencyAuthors";
import ResultsView from "@/components/ResultsView";

export default function Home() {
  const [week, setWeek] = useState<string | null>(null);
  const [lines, setLines] = useState<string[]>([]);

  return (
    <main className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
      {/* Plaque title */}
      <div>
        <Image
          src="/bestseller-title-plaque.png"
          alt=""
          width={800}
          height={200}
          className="block mx-auto md:w-96 h-auto object-contain"
          priority
        />
        {/* <div className="text-neutral-900 p-3 font-serif">
          Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque
          faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi
          pretium tellus duis convallis. Tempus leo eu aenean sed diam urna
          tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas.
          Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut
          hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent
          per conubia nostra inceptos himenaeos.
        </div> */}
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left column: lists, 1/3 */}
        <div className="md:col-span-1 space-y-6">
          <section>
            <AuthorInput />
          </section>

          <section>
            <AgencyAuthors />
          </section>
        </div>

        {/* Right column: actions, 2/3 */}
        <div className="md:col-span-2 space-y-4">
          <PdfUpload
            onResults={(w, l) => {
              setWeek(w);
              setLines(l);
            }}
          />
          <div className="text-center text-xs tracking-widest text-neutral-100">
            — OR —
          </div>

          <div className="space-y-2">
            <Results
              onResults={(w, l) => {
                setWeek(w);
                setLines(l);
              }}
            />
          </div>

          {/* Results */}
          <div className="space-y-2">
            {/* {lines.map((l, i) => (
              <div key={i} className="font-mono text-sm text-neutral-50">
                {l}
              </div>
            ))} */}
            <ResultsView week={week} lines={lines} />
          </div>
        </div>
      </div>
    </main>
  );
}
