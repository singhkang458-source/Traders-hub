"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { MARKET_LABELS, type CourseView } from "@/lib/course-types";
import type { ProviderView } from "@/lib/provider-types";
import {
  EMPTY_FILTERS,
  filtersFromQuery,
  filtersToQuery,
  listingFromCourse,
  listingFromProvider,
  matchesFilters,
  type Filters,
  type Listing,
} from "@/lib/course-filters";
import TrustpilotStars from "@/components/TrustpilotStars";
import OurChoiceBadge from "@/components/OurChoiceBadge";
import SaveButton from "@/components/SaveButton";
import Picker from "@/components/Picker";
import { SearchIcon } from "@/components/icons";

type Entry = {
  id: string;
  name: string;
  logo: string | null;
  logoBg: "white" | "dark";
  tagline: string | null;
  trustpilot: CourseView["trustpilot"];
  whop: CourseView["whop"];
  fromPrice: string | null;
  href: string;
  /** Set only for a multi-course provider, e.g. "6 courses". */
  courseCountLabel: string | null;
  listing: Listing;
  /** A real tracked affiliate link means we actually earn from this listing
   *  — those are the ones we vouch for enough to put our name behind, so
   *  they get the Our choice badge and sort first. Not a performance claim. */
  affiliateLink: string | null;
};

const RATING_OPTIONS = ["3", "3.5", "4", "4.5"];

// Grid of cards — the "browse options" view. Takes both standalone courses
// (one card, one page) and multi-course providers like Sharper Trades (one
// card, linking to a hub page that lists its several courses). Filters work
// the same way as the Funded Accounts page's: saved in the address, so a
// trip into a course and back keeps them.
export default function CourseDirectory({
  courses,
  providers = [],
}: {
  courses: CourseView[];
  providers?: ProviderView[];
}) {
  return (
    <Suspense fallback={<Directory courses={courses} providers={providers} initialFilters={EMPTY_FILTERS} />}>
      <DirectoryFromAddress courses={courses} providers={providers} />
    </Suspense>
  );
}

function DirectoryFromAddress({
  courses,
  providers,
}: {
  courses: CourseView[];
  providers: ProviderView[];
}) {
  const searchParams = useSearchParams();
  return <Directory courses={courses} providers={providers} initialFilters={filtersFromQuery(searchParams)} />;
}

function Directory({
  courses,
  providers,
  initialFilters,
}: {
  courses: CourseView[];
  providers: ProviderView[];
  initialFilters: Filters;
}) {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareNote, setCompareNote] = useState("");

  function toggleCompare(id: string) {
    if (compareIds.includes(id)) {
      setCompareIds((ids) => ids.filter((i) => i !== id));
      setCompareNote("");
      return;
    }
    if (compareIds.length >= 3) {
      setCompareNote("You can compare up to 3 courses. Remove one to add another.");
      return;
    }
    setCompareIds((ids) => [...ids, id]);
    setCompareNote("");
  }

  const entries: Entry[] = [
    ...courses.map((c) => ({
      id: c.id,
      name: c.name,
      logo: c.logo,
      logoBg: c.logoBg,
      tagline: c.tagline,
      trustpilot: c.trustpilot,
      whop: c.whop,
      fromPrice: c.pricing[0]?.price ?? null,
      href: `/courses/${c.id}`,
      courseCountLabel: null,
      listing: listingFromCourse(c),
      affiliateLink: c.affiliateLink,
    })),
    ...providers.map((p) => {
      const prices = p.courses.flatMap((c) => c.pricing[0]?.price ?? []);
      return {
        id: p.id,
        name: p.name,
        logo: p.logo,
        logoBg: p.logoBg,
        tagline: p.tagline,
        trustpilot: p.trustpilot,
        whop: p.whop,
        fromPrice: prices[0] ?? null,
        href: `/courses/${p.id}`,
        courseCountLabel: `${p.courses.length} courses`,
        listing: listingFromProvider(p),
        affiliateLink: p.affiliateLink,
      };
    }),
  ];

  // Only offer markets that actually exist across the current listings.
  const marketOptions = [...new Set(entries.flatMap((e) => e.listing.markets))].sort((a, b) =>
    MARKET_LABELS[a].localeCompare(MARKET_LABELS[b]),
  );

  // Courses we actually earn from (a real tracked affiliate link, not just
  // any listing) sort first — Array.prototype.sort is stable, so within
  // each group the original order is kept.
  const matching = entries
    .filter((e) => matchesFilters(e.listing, filters))
    .sort((a, b) => Number(b.affiliateLink != null) - Number(a.affiliateLink != null));

  function updateFilters(changes: Partial<Filters>) {
    const next = { ...filters, ...changes };
    setFilters(next);
    window.history.replaceState(null, "", window.location.pathname + filtersToQuery(next));
  }

  const chips = activeFilterChips(filters);

  return (
    <div className={`prospectus${compareIds.length > 0 ? " pb-20" : ""}`}>
      <label className="prospectus-search">
        <SearchIcon className="size-4.5 shrink-0 text-subtle" />
        <span className="sr-only">Search courses by name</span>
        <input
          type="search"
          value={filters.search}
          onChange={(e) => updateFilters({ search: e.target.value })}
          placeholder="Search by name — e.g. “ICT” or “price action”"
          className="min-w-0 flex-1 bg-transparent py-3 text-base text-foreground placeholder:text-subtle"
        />
      </label>

      {/* Filter bar */}
      <form
        aria-label="Filter courses"
        className="prospectus-filters mt-4 grid grid-cols-2 gap-3 lg:grid-cols-5"
        onSubmit={(e) => e.preventDefault()}
      >
        <Select
          label="Market"
          value={filters.market}
          onChange={(v) => updateFilters({ market: v })}
          options={marketOptions.map((m) => [m, MARKET_LABELS[m]])}
        />
        <label className="flex flex-col gap-1">
          <span className="eyebrow">Max starting price</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            placeholder="Any"
            value={filters.maxPrice}
            onChange={(e) => updateFilters({ maxPrice: e.target.value })}
            className="field"
          />
        </label>
        <Select
          label="Rating"
          anyLabel="Any"
          value={filters.minRating}
          onChange={(v) => updateFilters({ minRating: v })}
          options={RATING_OPTIONS.map((r) => [r, `${r}+ stars`])}
        />
        <Select
          label="Live sessions"
          anyLabel="Any"
          value={filters.live}
          onChange={(v) => updateFilters({ live: v })}
          options={[["yes", "Yes"]]}
        />
        <Select
          label="Free tier"
          anyLabel="Any"
          value={filters.free}
          onChange={(v) => updateFilters({ free: v })}
          options={[["yes", "Yes"]]}
        />
      </form>

      {/* Result count + active filters as removable chips */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <p aria-live="polite" className="meta mr-1">
          <span className="font-semibold text-foreground">{matching.length}</span> of {entries.length}{" "}
          match
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
        <div className="prospectus-empty">
          <p className="text-muted">No courses match these filters.</p>
          <button type="button" onClick={() => updateFilters(EMPTY_FILTERS)} className="btn btn-outline mt-4">
            Clear filters and show everything
          </button>
        </div>
      ) : (
        <ul className="prospectus-list">
          {matching.map((entry) => {
            const held = compareIds.includes(entry.id);
            return (
            <li key={entry.id} className={`prospectus-entry${held ? " is-held" : ""}`}>
              <div className="prospectus-main">
                <div className="flex items-start gap-3">
                  {entry.logo ? (
                    <div
                      className={`flex size-14 shrink-0 items-center justify-center rounded-lg p-2 ${
                        entry.logoBg === "dark" ? "bg-black" : "bg-white"
                      }`}
                    >
                      <Image
                        src={entry.logo}
                        alt={`${entry.name} logo`}
                        width={56}
                        height={56}
                        className="h-auto max-h-9 w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-lg font-bold text-foreground">
                      {entry.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <h2 className="prospectus-title">
                        <Link href={entry.href} className="card-stretch prospectus-name">
                          {entry.name}
                        </Link>
                      </h2>
                      {entry.affiliateLink && <OurChoiceBadge />}
                    </div>
                    {(entry.trustpilot || entry.whop) && (
                      <div className="relative z-10 mt-2 flex flex-col gap-0.5 text-xs">
                        {entry.trustpilot && <TrustpilotStars rating={entry.trustpilot} size="sm" />}
                        {entry.whop && <TrustpilotStars rating={entry.whop} size="sm" platform="Whop" />}
                      </div>
                    )}
                  </div>
                  <div className="relative z-10 shrink-0">
                    <SaveButton kind="course" id={entry.id} name={entry.name} />
                  </div>
                </div>
                <span className="prospectus-rule" aria-hidden="true" />
                {entry.listing.markets.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {entry.listing.markets.map((m) => (
                      <span key={m} className="pill">
                        {MARKET_LABELS[m]}
                      </span>
                    ))}
                  </div>
                )}
                {entry.tagline && <p className="prospectus-blurb">{entry.tagline}</p>}
                <div className="prospectus-actions relative z-10">
                  <Link href={entry.href} className="btn btn-soft min-w-0 px-3">
                    {entry.courseCountLabel ? "View courses" : "View course"}
                    <span className="sr-only"> — {entry.name}</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                  <button
                    type="button"
                    aria-pressed={held}
                    onClick={() => toggleCompare(entry.id)}
                    className={`btn shrink-0 px-3 ${
                      held
                        ? "border-accent bg-accent/12 text-foreground"
                        : "border-border-strong text-muted hover:border-subtle hover:text-foreground"
                    }`}
                  >
                    <span aria-hidden="true" className="font-mono">
                      {held ? "✓" : "+"}
                    </span>
                    {held ? "Comparing" : "Compare"}
                    <span className="sr-only"> — {entry.name}</span>
                  </button>
                </div>
              </div>
              <aside className="prospectus-margin">
                {entry.fromPrice && (
                  <>
                    <div className="eyebrow">From</div>
                    <div className="prospectus-price">{entry.fromPrice}</div>
                  </>
                )}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {entry.listing.hasFreeTier && <span className="badge badge-success">Free tier</span>}
                  {entry.listing.hasLiveSessions && <span className="pill">Live sessions</span>}
                </div>
                {entry.courseCountLabel && <p className="meta mt-2">{entry.courseCountLabel}</p>}
              </aside>
            </li>
            );
          })}
        </ul>
      )}

      {compareIds.length > 0 && (
        <div className="tray-bottom fixed inset-x-0 z-40">
          <div className="container-page pb-4">
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border-strong bg-surface p-3 shadow-glow sm:p-4">
              <span className="meta hidden sm:inline">Comparing:</span>
              <div className="flex flex-wrap items-center gap-2">
                {compareIds.map((id) => {
                  const e = entries.find((en) => en.id === id);
                  if (!e) return null;
                  return (
                    <span
                      key={id}
                      className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-border-strong bg-surface-2 py-1 pl-3 pr-2 text-xs font-medium text-foreground"
                    >
                      {e.name}
                      <button
                        type="button"
                        onClick={() => toggleCompare(id)}
                        aria-label={`Remove ${e.name} from comparison`}
                        className="flex size-11 items-center justify-center text-muted hover:text-foreground"
                      >
                        ✕
                      </button>
                    </span>
                  );
                })}
              </div>
              {compareNote && <p role="status" className="meta w-full sm:w-auto">{compareNote}</p>}
              <div className="ml-auto flex items-center gap-3">
                {compareIds.length < 2 ? (
                  <span className="meta">Pick at least 2 to compare</span>
                ) : (
                  <Link href={`/courses/compare?ids=${compareIds.join(",")}`} className="btn btn-primary">
                    Compare ({compareIds.length})
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setCompareIds([]);
                    setCompareNote("");
                  }}
                  className="inline-flex min-h-11 items-center text-sm text-muted underline hover:text-foreground"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function activeFilterChips(f: Filters): { key: keyof Filters; label: string }[] {
  const chips: { key: keyof Filters; label: string }[] = [];
  if (f.search) chips.push({ key: "search", label: `“${f.search}”` });
  if (f.market) chips.push({ key: "market", label: MARKET_LABELS[f.market as keyof typeof MARKET_LABELS] ?? f.market });
  if (f.maxPrice) chips.push({ key: "maxPrice", label: `Max $${f.maxPrice}` });
  if (f.minRating) chips.push({ key: "minRating", label: `${f.minRating}+ stars` });
  if (f.live) chips.push({ key: "live", label: "Live sessions" });
  if (f.free) chips.push({ key: "free", label: "Free tier" });
  return chips;
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
