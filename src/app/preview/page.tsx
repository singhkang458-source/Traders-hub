import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Homepage concepts",
  robots: { index: false },
};

const CONCEPTS = [
  {
    href: "/preview/kinetic",
    name: "Kinetic",
    line: "The page is the words. Headlines fill the screen and drift as you scroll.",
  },
  {
    href: "/preview/tape",
    name: "Tape",
    line: "A gold news wire. Every section is announced by a ticker you can pause.",
  },
  {
    href: "/preview/candle",
    name: "Candle",
    line: "The homepage is one chart of its own sections. Not a price, and not a result.",
  },
];

export default function PreviewIndex() {
  return (
    <div className="hx-index">
      <p className="eyebrow">Homepage previews</p>
      <h1 className="page-title mt-2">Three ways in. Pick one.</h1>
      <ul>
        {CONCEPTS.map((concept) => (
          <li key={concept.href}>
            <Link href={concept.href}>
              <span>{concept.name}</span>
              <span>{concept.line}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
