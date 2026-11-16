import type { Metadata } from "next";
import Link from "next/link";
import { GLOSSARY } from "@/lib/glossary";

export const metadata: Metadata = {
  title: "Glossary",
  description: "Plain-English definitions of the trading terms used across the site.",
};

// Every term in the strategies glossary on one page, so a search hit on a
// term has somewhere to land (the same definitions power the hover tooltips
// on strategy pages — see GlossaryTerm.tsx). Sorted A–Z; each term has its
// own anchor so /glossary#rsi links straight to it.
function glossaryAnchor(term: string): string {
  return term.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export default function GlossaryPage() {
  const entries = [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term));
  const letters = [...new Set(entries.map((e) => e.term[0].toUpperCase()))];

  return (
    <div>
      <header>
        <p className="eyebrow">Plain English</p>
        <h1 className="page-title mt-2">Glossary</h1>
        <p className="dict-lede">
          {entries.length} trading terms, each explained in a sentence or two. These are the same
          definitions that pop up when you hover a term on a{" "}
          <Link href="/strategies" className="text-accent hover:underline">
            strategy page
          </Link>
          .
        </p>
      </header>

      <div className="dict">
        <nav className="dict-index" aria-label="Jump to letter">
          {letters.map((l) => (
            <a key={l} href={`#letter-${l}`}>
              {l}
            </a>
          ))}
        </nav>

        <div>
          {letters.map((letter) => {
            const group = entries.filter((e) => e.term[0].toUpperCase() === letter);
            return (
              <section key={letter} className="dict-letter" aria-labelledby={`letter-${letter}`}>
                <h2 id={`letter-${letter}`} className="dict-mark">
                  {letter}
                </h2>
                <dl>
                  {group.map((e) => (
                    <div key={e.term} id={glossaryAnchor(e.term)} className="dict-entry">
                      <dt>{e.term}</dt>
                      <dd>{e.definition}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            );
          })}
        </div>
      </div>

      <p className="meta mt-10 max-w-2xl">
        Definitions are general explanations for learning, not advice and not a recommendation to
        trade anything.
      </p>
    </div>
  );
}
