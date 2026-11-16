"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import {
  STRATEGY_CATEGORY_ICONS,
  STRATEGY_CATEGORY_LABELS,
  STRATEGY_DIFFICULTY_LABELS,
  STRATEGY_MARKET_LABELS,
  STRATEGY_TIER_LABELS,
  type StrategyCategory,
  type StrategyView,
} from "@/lib/strategy-types";
import {
  EMPTY_FILTERS,
  filtersFromQuery,
  filtersToQuery,
  matchesFilters,
  type Filters,
} from "@/lib/strategy-filters";
import { SearchIcon, ShieldIcon } from "@/components/icons";
import SaveButton from "@/components/SaveButton";
import Picker from "@/components/Picker";
import { DoneTick } from "@/components/ProgressBits";

// Strategy categories in a fixed, deliberate order (not alphabetical) for
// the quick-pick pill row — trend-following and mean-reversion first since
// they're the two a beginner hears about most.
const CATEGORY_ORDER: StrategyCategory[] = [
  "trend_following",
  "mean_reversion",
  "breakout",
  "price_action",
  "momentum",
  "volume_order_flow",
  "market_structure",
  "quantitative",
];

// Same filter-bar pattern as CourseDirectory/PropFirmDirectory: state saved
// in the address so a trip into a strategy page and back keeps the filters.
// Only 5 of the research doc's ~11 facets became real filter controls (tier,
// market, difficulty, style, controversy) — execution type, data requirement,
// platform testability and independent-evidence rating still exist in the
// data but aren't surfaced in the UI, to keep the bar usable on a phone and
// because a rating badge reads as a performance score, which this site
// doesn't do (see CLAUDE.md).
export default function StrategyDirectory({ strategies }: { strategies: StrategyView[] }) {
  return (
    <Suspense fallback={<Directory strategies={strategies} initialFilters={EMPTY_FILTERS} />}>
      <DirectoryFromAddress strategies={strategies} />
    </Suspense>
  );
}

function DirectoryFromAddress({ strategies }: { strategies: StrategyView[] }) {
  const searchParams = useSearchParams();
  return <Directory strategies={strategies} initialFilters={filtersFromQuery(searchParams)} />;
}

function Directory({
  strategies,
  initialFilters,
}: {
  strategies: StrategyView[];
  initialFilters: Filters;
}) {
  const [filters, setFilters] = useState<Filters>(initialFilters);

  const matching = strategies.filter((s) => matchesFilters(s, filters));

  function updateFilters(changes: Partial<Filters>) {
    const next = { ...filters, ...changes };
    setFilters(next);
    window.history.replaceState(null, "", window.location.pathname + filtersToQuery(next));
  }

  const chips = activeFilterChips(filters);
  const marketOptions = [...new Set(strategies.flatMap((s) => s.markets))].sort((a, b) =>
    STRATEGY_MARKET_LABELS[a].localeCompare(STRATEGY_MARKET_LABELS[b]),
  );
  const categoriesPresent = new Set(strategies.map((s) => s.category));

  return (
    <div>
      {/* One-click browse by style, leading with the icons from the cards
          below so the same visual language carries through. */}
      <ul className="plot-keys">
        {CATEGORY_ORDER.filter((c) => categoriesPresent.has(c)).map((c) => {
          const Icon = STRATEGY_CATEGORY_ICONS[c];
          const active = filters.category === c;
          return (
            <li key={c} className="shrink-0">
              <button
                type="button"
                onClick={() => updateFilters({ category: active ? "" : c })}
                aria-pressed={active}
                className={`plot-key${active ? " is-on" : ""}`}
              >
                <Icon className="size-4" />
                {STRATEGY_CATEGORY_LABELS[c]}
              </button>
            </li>
          );
        })}
      </ul>

      <label className="plot-search">
        <SearchIcon className="size-4.5 shrink-0 text-subtle" />
        <span className="sr-only">Search strategies by name</span>
        <input
          type="search"
          value={filters.search}
          onChange={(e) => updateFilters({ search: e.target.value })}
          placeholder="Search by name — e.g. “RSI” or “breakout”"
          className="min-w-0 flex-1 bg-transparent py-3 text-base text-foreground outline-none placeholder:text-subtle"
        />
      </label>

      <form
        aria-label="Filter strategies"
        className="plot-filters mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
        onSubmit={(e) => e.preventDefault()}
      >
        <Select
          label="Tier"
          value={filters.tier}
          onChange={(v) => updateFilters({ tier: v })}
          options={(["free", "intermediate", "advanced"] as const).map((t) => [t, STRATEGY_TIER_LABELS[t]])}
        />
        <Select
          label="Market"
          value={filters.market}
          onChange={(v) => updateFilters({ market: v })}
          options={marketOptions.map((m) => [m, STRATEGY_MARKET_LABELS[m]])}
        />
        <Select
          label="Difficulty"
          value={filters.difficulty}
          onChange={(v) => updateFilters({ difficulty: v })}
          options={(["beginner", "intermediate", "advanced"] as const).map((d) => [d, STRATEGY_DIFFICULTY_LABELS[d]])}
        />
        <Select
          label="Controversial methods"
          anyLabel="Show all"
          value={filters.controversial}
          onChange={(v) => updateFilters({ controversial: v })}
          options={[["hide", "Hide controversial"]]}
        />
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <p aria-live="polite" className="meta mr-1">
          <span className="font-semibold text-foreground">{matching.length}</span> of {strategies.length} match
        </p>
        {chips.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => updateFilters({ [key]: "" })}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border-strong bg-surface-2 py-1 pl-3 pr-2 text-xs font-medium text-foreground transition-colors hover:border-subtle"
          >
            {label}
            <span aria-hidden="true" className="text-muted">
              ✕
            </span>
            <span className="sr-only">(remove filter)</span>
          </button>
        ))}
        {chips.length > 1 && (
          <button
            type="button"
            onClick={() => updateFilters(EMPTY_FILTERS)}
            className="inline-flex min-h-11 items-center text-xs text-muted underline hover:text-foreground"
          >
            Clear all
          </button>
        )}
      </div>

      {matching.length === 0 ? (
        <div className="plot-empty">
          <p className="text-muted">No strategies match these filters.</p>
          <button type="button" onClick={() => updateFilters(EMPTY_FILTERS)} className="btn btn-outline mt-4">
            Clear filters and show everything
          </button>
        </div>
      ) : (
        <>
        <p className="plot-diagram-note">
          Each drawing is a category diagram. It is not a price, and it is not a result.
        </p>
        <ul className="plot-sheet">
          {matching.map((s) => (
            <StrategyCard key={s.slug} strategy={s} listingQuery={filtersToQuery(filters)} />
          ))}
        </ul>
        </>
      )}
    </div>
  );
}

// Same card as CourseDirectory/PropFirmDirectory (kit-panel + listing-card,
// logo/name/badge row, market pills, blurb, a divider with one headline
// stat, then a soft primary button and a quiet secondary) so the three
// listing pages read as one design. The headline stat here is the tier —
// strategies have no price, and a rating would read as a performance
// score, which this site never shows.
function StrategyCard({ strategy: s, listingQuery }: { strategy: StrategyView; listingQuery: string }) {
  const href = listingQuery ? `/strategies/${s.slug}${listingQuery}` : `/strategies/${s.slug}`;

  return (
    <li className="plot-mark">
      <CategoryTrace category={s.category} />
      <div className="min-w-0">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h2 className="plot-name">
                <Link href={href} className="card-stretch plot-title">
                  {s.name}
                </Link>
              </h2>
              <DoneTick kind="quiz" id={s.slug} />
            </div>
            <p className="mt-1 text-xs font-medium text-subtle">{STRATEGY_CATEGORY_LABELS[s.category]}</p>
          </div>
          <div className="relative z-10 shrink-0">
            <SaveButton kind="strategy" id={s.slug} name={s.name} />
          </div>
        </div>

        {s.markets.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {s.markets.slice(0, 3).map((m) => (
              <span key={m} className="pill">
                {STRATEGY_MARKET_LABELS[m]}
              </span>
            ))}
            {s.markets.length > 3 && <span className="pill">+{s.markets.length - 3} more</span>}
          </div>
        )}

        <p className="mt-2 text-sm leading-relaxed text-muted">{s.publicTeaser}</p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="plot-tier">{STRATEGY_TIER_LABELS[s.tier]}</span>
          <span className="pill">{STRATEGY_DIFFICULTY_LABELS[s.difficulty]}</span>
          {s.controversyFlag && (
            <span className="badge badge-warning inline-flex items-center gap-1">
              <ShieldIcon className="size-3" />
              Debated
            </span>
          )}
        </div>

        <div className="relative z-10 mt-3 flex flex-wrap gap-2">
          <Link href={href} className="btn btn-soft min-w-0 px-3">
            View strategy
            <span className="sr-only"> — {s.name}</span>
            <span aria-hidden="true">→</span>
          </Link>
          <Link
            href={`${href}#simulator-heading`}
            className="btn shrink-0 border-border-strong px-3 text-muted hover:border-subtle hover:text-foreground"
          >
            Try it live
            <span className="sr-only"> — {s.name} simulator</span>
          </Link>
        </div>
      </div>
    </li>
  );
}

function CategoryTrace({ category }: { category: StrategyCategory }) {
  return (
    <svg viewBox="0 0 88 40" className="plot-trace" aria-hidden="true">
      {category === "trend_following" && <path d="M4 24 L18 14 L30 22 L46 12 L58 26 L72 16 L84 22" />}
      {category === "mean_reversion" && <path d="M4 20 Q16 6 28 20 T52 20 T76 20" />}
      {category === "breakout" && <path d="M4 20 H34 L48 8 L62 20 H84" />}
      {category === "price_action" && <path d="M6 22 L20 12 L32 26 L48 10 L62 24 L84 16" />}
      {category === "momentum" && <path d="M4 20 C12 10 18 30 28 20 C38 8 46 32 58 20 C68 10 76 30 84 20" />}
      {category === "volume_order_flow" && (
        <path d="M10 30 V18 M22 30 V10 M34 30 V22 M46 30 V8 M58 30 V16 M70 30 V12 M82 30 V20" />
      )}
      {category === "market_structure" && <path d="M4 26 L16 12 L28 22 L44 10 L58 24 L72 14 L84 20" />}
      {category === "quantitative" && (
        <g>
          <path d="M6 20 H82" strokeDasharray="2 3" />
          <path d="M16 20 V20 M32 14 V14 M48 26 V26 M64 12 V12 M78 22 V22" />
          <circle cx="16" cy="20" r="2.2" />
          <circle cx="32" cy="14" r="2.2" />
          <circle cx="48" cy="26" r="2.2" />
          <circle cx="64" cy="12" r="2.2" />
          <circle cx="78" cy="22" r="2.2" />
        </g>
      )}
    </svg>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  anyLabel = "All",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
  anyLabel?: string;
}) {
  return (
    <Picker
      label={label}
      value={value}
      onChange={onChange}
      options={[{ value: "", label: anyLabel }, ...options.map(([v, text]) => ({ value: v, label: text }))]}
    />
  );
}

function activeFilterChips(f: Filters): { key: keyof Filters; label: string }[] {
  const chips: { key: keyof Filters; label: string }[] = [];
  if (f.search) chips.push({ key: "search", label: `“${f.search}”` });
  if (f.tier) chips.push({ key: "tier", label: STRATEGY_TIER_LABELS[f.tier as keyof typeof STRATEGY_TIER_LABELS] });
  if (f.market) chips.push({ key: "market", label: STRATEGY_MARKET_LABELS[f.market as keyof typeof STRATEGY_MARKET_LABELS] });
  if (f.difficulty)
    chips.push({ key: "difficulty", label: STRATEGY_DIFFICULTY_LABELS[f.difficulty as keyof typeof STRATEGY_DIFFICULTY_LABELS] });
  if (f.category)
    chips.push({ key: "category", label: STRATEGY_CATEGORY_LABELS[f.category as keyof typeof STRATEGY_CATEGORY_LABELS] });
  if (f.controversial) chips.push({ key: "controversial", label: "Hiding controversial" });
  return chips;
}
