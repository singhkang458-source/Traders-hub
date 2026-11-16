import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Homepage concepts",
  robots: { index: false },
};

const CONCEPTS = [
  {
    href: "/preview/kinetic",
    name: "Spine",
    line: "The headline stands down the side of the page. The seven sections live in a sideways band.",
  },
  {
    href: "/preview/tape",
    name: "Book",
    line: "The homepage is a terminal. You open one section at a time from a list of rows.",
  },
  {
    href: "/preview/candle",
    name: "Trace",
    line: "You travel down the page along a gold line. Each section is a stop on that path.",
  },
];

export default function PreviewIndex() {
  return (
    <div className="hx-index">
      <p className="eyebrow">Homepage previews</p>
      <h1 className="page-title mt-2">Three different pages.</h1>
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
