import type { Metadata } from "next";
import Link from "next/link";
import { getSection } from "@/lib/sections";
import { strategies, strategiesInDisplayOrder } from "@/lib/strategies";
import StrategyDirectory from "@/components/StrategyDirectory";
import { ProgressSummary } from "@/components/ProgressBits";

const section = getSection("strategies");

export const metadata: Metadata = { title: section.title };

export default function StrategiesPage() {
  const freeCount = strategies.filter((s) => s.tier === "free").length;
  const intermediateCount = strategies.filter((s) => s.tier === "intermediate").length;
  const advancedCount = strategies.filter((s) => s.tier === "advanced").length;

  return (
    <div className="plot-page">
      <header className="plot-mast">
        <p className="eyebrow">{section.title}</p>
        <h1 className="page-title mt-2 max-w-3xl">
          Learn a strategy, then <span className="plot-emphasis">prove</span> you&apos;ve got it
        </h1>
        <p className="plot-lede">
          {strategies.length} trading strategies explained in plain English — what each one is,
          how it&apos;s traditionally traded, and a live chart you can click on, right on the
          page. Never a claim that any of them will make you money.
        </p>
        <ul className="plot-legend">
          <li>
            <span className="plot-swatch" aria-hidden="true" />
            <span>Free</span>
            <strong>{freeCount}</strong>
          </li>
          <li>
            <span className="plot-swatch" aria-hidden="true" />
            <span>Intermediate</span>
            <strong>{intermediateCount}</strong>
          </li>
          <li>
            <span className="plot-swatch" aria-hidden="true" />
            <span>Advanced</span>
            <strong>{advancedCount}</strong>
          </li>
          <li>
            <span className="plot-swatch" aria-hidden="true" />
            <span>With a live quiz</span>
            <strong>{strategies.length}</strong>
          </li>
        </ul>
        <p className="plot-footnote">
          Every strategy has a live simulator — shuffle the chart, test yourself, no account needed.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a href="#browse" className="btn btn-primary">
            Browse all strategies
          </a>
          <Link href="/disclaimer" className="btn btn-outline">
            Read the disclaimer
          </Link>
        </div>
      </header>

      <div id="browse" className="plot-browse">
        <h2 className="section-title text-2xl">Browse the library</h2>
        <p className="meta mt-1.5 max-w-2xl">
          Educational write-ups only, never financial advice. The free tier is open to everyone;
          the rest is open too while we finish building the paid library — see the{" "}
          <Link href="/disclaimer" className="text-accent hover:underline">
            disclaimer
          </Link>{" "}
          for the full picture.
        </p>
        <ProgressSummary kind="quiz" ids={strategies.map((s) => s.slug)} noun="quizzes" className="mt-4 max-w-xl" />
        <div className="mt-6">
          <StrategyDirectory strategies={strategiesInDisplayOrder} />
        </div>
      </div>
    </div>
  );
}
