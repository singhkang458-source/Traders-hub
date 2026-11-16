"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createContext, Suspense, useContext, useMemo, useState, type ReactNode } from "react";
import CountrySwitch, { useCountry } from "@/components/CountrySwitch";
import { MARKET_LABELS } from "@/components/PropFirmPricing";
import SaveButton from "@/components/SaveButton";
import VisitSiteLink from "@/components/VisitSiteLink";
import Picker from "@/components/Picker";
import { firmAvailability, type Availability } from "@/lib/countries";
import {
  MAX_COMPARE,
  defaultPlanFor,
  plansToQuery,
  samePlan,
  type PlanKey,
} from "@/lib/propfirm-compare";
import {
  EMPTY_FILTERS,
  allAccounts,
  filtersFromQuery,
  filtersToQuery,
  matchesFilters,
  type Account,
  type Filters,
} from "@/lib/propfirm-filters";
import type { FirmView } from "@/lib/propfirm-types";

function uniqueSorted<T>(values: T[], compare?: (a: T, b: T) => number): T[] {
  return [...new Set(values)].sort(compare);
}

function money(n: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function sizeLabel(size: number) {
  return `${size / 1000}K`;
}

export type FirmRow = {
  firm: FirmView;
  matches: Account[];
  availability: Availability | null;
  cheapest: Account | null;
  priceLabel: string | null;
  maxSplit: number | null;
  sizeText: string;
  inCompare: boolean;
};

type Browser = {
  firms: FirmView[];
  filters: Filters;
  updateFilters: (changes: Partial<Filters>) => void;
  chips: { key: keyof Filters; label: string }[];
  country: string;
  setCountry: (code: string) => void;
  matching: FirmRow[];
  restricted: FirmRow[];
  unknownCount: number;
  challengeOptions: string[];
  sizeOptions: number[];
  splitOptions: number[];
  marketCount: (market: "" | "forex" | "futures") => number;
  comparePlans: PlanKey[];
  compareNote: string;
  toggleCompare: (row: FirmRow) => void;
  clearCompare: () => void;
  query: string;
  compareHref: string;
};

const Ctx = createContext<Browser | null>(null);

export function useFirms() {
  const value = useContext(Ctx);
  if (!value) throw new Error("useFirms must be used inside FirmBrowser");
  return value;
}

export default function FirmBrowser({ firms, children }: { firms: FirmView[]; children: ReactNode }) {
  return (
    <Suspense fallback={<BrowserState firms={firms} initial={EMPTY_FILTERS}>{children}</BrowserState>}>
      <BrowserFromAddress firms={firms}>{children}</BrowserFromAddress>
    </Suspense>
  );
}

function BrowserFromAddress({ firms, children }: { firms: FirmView[]; children: ReactNode }) {
  const params = useSearchParams();
  return (
    <BrowserState firms={firms} initial={filtersFromQuery(params)}>
      {children}
    </BrowserState>
  );
}

function BrowserState({
  firms,
  initial,
  children,
}: {
  firms: FirmView[];
  initial: Filters;
  children: ReactNode;
}) {
  const [filters, setFilters] = useState<Filters>(initial);
  const [comparePlans, setComparePlans] = useState<PlanKey[]>([]);
  const [compareNote, setCompareNote] = useState("");
  const [country, setCountry] = useCountry();

  const accountsByFirm = useMemo(() => new Map(firms.map((f) => [f.id, allAccounts(f)])), [firms]);
  const everyAccount = useMemo(() => [...accountsByFirm.values()].flat(), [accountsByFirm]);

  const inMarket = everyAccount.filter((a) => !filters.market || a.market === filters.market);
  const challengeOptions = uniqueSorted(inMarket.map((a) => a.challengeLabel));
  const sizeOptions = uniqueSorted(
    inMarket.filter((a) => !filters.challenge || a.challengeLabel === filters.challenge).map((a) => a.size),
    (a, b) => a - b,
  );
  const splitOptions = uniqueSorted(
    everyAccount.map((a) => a.profitSplit).filter((s): s is number => s != null),
    (a, b) => a - b,
  );

  function updateFilters(changes: Partial<Filters>) {
    const next = { ...filters, ...changes };
    const nextInMarket = everyAccount.filter((a) => !next.market || a.market === next.market);
    if (next.challenge && !nextInMarket.some((a) => a.challengeLabel === next.challenge)) next.challenge = "";
    if (
      next.size &&
      !nextInMarket.some((a) => a.size === Number(next.size) && (!next.challenge || a.challengeLabel === next.challenge))
    ) {
      next.size = "";
    }
    setFilters(next);
    const params = new URLSearchParams(filtersToQuery(next));
    if (country) params.set("country", country);
    const qs = params.toString();
    window.history.replaceState(null, "", window.location.pathname + (qs ? `?${qs}` : ""));
  }

  const rows = firms
    .map((firm) => {
      const matches = accountsByFirm.get(firm.id)!.filter((a) => matchesFilters(a, filters));
      const cheapest = matches
        .filter((a) => a.lowestPrice != null)
        .reduce<Account | null>((best, a) => (best == null || a.lowestPrice! < best.lowestPrice! ? a : best), null);
      const splits = matches.map((a) => a.profitSplit).filter((s): s is number => s != null);
      const sizes = matches.map((a) => a.size);
      const minSize = sizes.length ? Math.min(...sizes) : 0;
      const maxSize = sizes.length ? Math.max(...sizes) : 0;
      return {
        firm,
        matches,
        availability: country ? firmAvailability(firm.countries, country) : null,
        cheapest,
        priceLabel: cheapest ? money(cheapest.lowestPrice!, firm.currency) : null,
        maxSplit: splits.length ? Math.max(...splits) : null,
        sizeText: sizes.length === 0 ? "—" : minSize === maxSize ? sizeLabel(minSize) : `${sizeLabel(minSize)}–${sizeLabel(maxSize)}`,
        inCompare: comparePlans.some((p) => p.firm === firm.id),
      } satisfies FirmRow;
    })
    .filter((row) => row.matches.length > 0);

  const matching = rows.filter((row) => row.availability?.status !== "restricted");
  const restricted = rows.filter((row) => row.availability?.status === "restricted");

  function toggleCompare(row: FirmRow) {
    const existing = comparePlans.find((p) => p.firm === row.firm.id);
    if (existing) {
      setComparePlans((ps) => ps.filter((p) => p.firm !== row.firm.id));
      setCompareNote("");
      return;
    }
    if (comparePlans.length >= MAX_COMPARE) {
      setCompareNote(`You can compare up to ${MAX_COMPARE} firms. Remove one to add another.`);
      return;
    }
    const match = row.cheapest ?? row.matches[0];
    const plan = defaultPlanFor(
      row.firm,
      match ? { market: match.market, challenge: match.challengeKey, tier: match.tier, size: match.size } : undefined,
    );
    if (!plan) return;
    setComparePlans((ps) => (ps.some((p) => samePlan(p, plan)) ? ps : [...ps, plan]));
    setCompareNote("");
  }

  const value: Browser = {
    firms,
    filters,
    updateFilters,
    chips: activeFilterChips(filters),
    country,
    setCountry,
    matching,
    restricted,
    unknownCount: matching.filter((row) => row.availability?.status === "unknown").length,
    challengeOptions,
    sizeOptions,
    splitOptions,
    marketCount: (market) =>
      market ? firms.filter((f) => f.markets.some((m) => m.market === market)).length : firms.length,
    comparePlans,
    compareNote,
    toggleCompare,
    clearCompare: () => {
      setComparePlans([]);
      setCompareNote("");
    },
    query: filtersToQuery(filters),
    compareHref: `/funded-accounts/compare${plansToQuery(comparePlans)}`,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function activeFilterChips(f: Filters): { key: keyof Filters; label: string }[] {
  const chips: { key: keyof Filters; label: string }[] = [];
  if (f.market) chips.push({ key: "market", label: MARKET_LABELS[f.market as keyof typeof MARKET_LABELS] ?? f.market });
  if (f.challenge) chips.push({ key: "challenge", label: f.challenge });
  if (f.size) chips.push({ key: "size", label: `${sizeLabel(Number(f.size))} account` });
  if (f.maxPrice) chips.push({ key: "maxPrice", label: `Max price ${f.maxPrice}` });
  if (f.minSplit) chips.push({ key: "minSplit", label: `${f.minSplit}%+ split` });
  if (f.feeRefund) chips.push({ key: "feeRefund", label: `Fee refund: ${f.feeRefund === "yes" ? "Yes" : "No"}` });
  return chips;
}

export const TOOL_LINKS = [
  { href: "/funded-accounts/find-my-firm", label: "Find my firm", hint: "5 quick questions" },
  { href: "/funded-accounts/compare", label: "Compare plans", hint: "Up to 3 side by side" },
  { href: "/deals", label: "Deals & codes", hint: "Every active promo" },
  { href: "/funded-accounts/cost-calculator", label: "Cost calculator", hint: "What a challenge really costs" },
  { href: "/funded-accounts/drawdown-explained", label: "Drawdown explained", hint: "Static vs trailing, live" },
];

export function MarketSwitch({ stacked = false }: { stacked?: boolean }) {
  const { filters, updateFilters, marketCount } = useFirms();
  const options = [
    ["", "All firms"],
    ["forex", MARKET_LABELS.forex],
    ["futures", MARKET_LABELS.futures],
  ] as const;
  return (
    <div className={stacked ? "fx-markets is-stack" : "fx-markets"} role="group" aria-label="Market">
      {options.map(([value, label]) => (
        <button key={value || "all"} type="button" aria-pressed={filters.market === value} onClick={() => updateFilters({ market: value })}>
          <span>{label}</span>
          <span>{marketCount(value)}</span>
        </button>
      ))}
    </div>
  );
}

export function FilterFields() {
  const { filters, updateFilters, challengeOptions, sizeOptions, splitOptions } = useFirms();
  return (
    <form aria-label="Filter prop firm accounts" className="fx-filters" onSubmit={(e) => e.preventDefault()}>
      <Picker
        label="Challenge type"
        value={filters.challenge}
        onChange={(v) => updateFilters({ challenge: v })}
        options={[{ value: "", label: "All" }, ...challengeOptions.map((c) => ({ value: c, label: c }))]}
      />
      <Picker
        label="Account size"
        value={filters.size}
        onChange={(v) => updateFilters({ size: v })}
        options={[{ value: "", label: "All" }, ...sizeOptions.map((s) => ({ value: String(s), label: sizeLabel(s) }))]}
      />
      <label className="fx-price">
        <span>Max price</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          placeholder="Any"
          value={filters.maxPrice}
          onChange={(e) => updateFilters({ maxPrice: e.target.value })}
        />
      </label>
      <Picker
        label="Profit split"
        value={filters.minSplit}
        onChange={(v) => updateFilters({ minSplit: v })}
        options={[{ value: "", label: "Any" }, ...splitOptions.map((s) => ({ value: String(s), label: `${s}% or more` }))]}
      />
      <Picker
        label="Fee refund"
        value={filters.feeRefund}
        onChange={(v) => updateFilters({ feeRefund: v })}
        options={[
          { value: "", label: "Any" },
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ]}
      />
    </form>
  );
}

export function FilterChips() {
  const { chips, updateFilters } = useFirms();
  if (chips.length === 0) return null;
  return (
    <div className="fx-chips">
      {chips.map((chip) => (
        <button key={chip.key} type="button" onClick={() => updateFilters({ [chip.key]: "" })}>
          {chip.label}
          <span className="sr-only">, remove filter</span>
        </button>
      ))}
      {chips.length > 1 && (
        <button type="button" onClick={() => updateFilters(EMPTY_FILTERS)}>
          Clear all
        </button>
      )}
    </div>
  );
}

export function MatchLine() {
  const { matching, firms } = useFirms();
  return (
    <p aria-live="polite" className="fx-match">
      <span>{matching.length}</span> of {firms.length} firms match
    </p>
  );
}

export function CountryControl() {
  const { country, setCountry, restricted, unknownCount } = useFirms();
  return <CountrySwitch country={country} onChange={setCountry} hiddenCount={restricted.length} unknownCount={unknownCount} />;
}

export function ToolLinks() {
  return (
    <nav className="fx-tools" aria-label="Prop firm tools">
      {TOOL_LINKS.map((tool) => (
        <Link key={tool.href} href={tool.href}>
          <span>{tool.label}</span>
          <span>{tool.hint}</span>
        </Link>
      ))}
    </nav>
  );
}

export function FirmFlags({ row }: { row: FirmRow }) {
  if (!row.firm.reviewAlert && row.availability?.status !== "unknown") return null;
  return (
    <p className="fx-flags">
      {row.firm.reviewAlert && <span>Payout complaints in recent reviews</span>}
      {row.availability?.status === "unknown" && <span title={row.availability.reason}>Country list not published</span>}
    </p>
  );
}

export function FirmLinks({ row }: { row: FirmRow }) {
  const { query, toggleCompare } = useFirms();
  return (
    <div className="fx-links">
      <Link href={`/funded-accounts/${row.firm.id}${query}`}>
        View challenges
        <span className="sr-only"> — {row.firm.name}</span>
      </Link>
      <button type="button" aria-pressed={row.inCompare} onClick={() => toggleCompare(row)}>
        {row.inCompare ? "Comparing" : "Compare"}
        <span className="sr-only"> — {row.firm.name}</span>
      </button>
      <SaveButton kind="firm" id={row.firm.id} name={row.firm.name} />
      {row.firm.affiliateLink && <VisitSiteLink href={row.firm.affiliateLink} firmName={row.firm.name} variant="outline" />}
    </div>
  );
}

export function EmptyFirms() {
  const { updateFilters } = useFirms();
  return (
    <div className="fx-empty">
      <p>No firms have accounts matching these filters.</p>
      <button type="button" onClick={() => updateFilters(EMPTY_FILTERS)}>
        Clear filters and show everything
      </button>
    </div>
  );
}

export function RestrictedFirms() {
  const { restricted, query } = useFirms();
  if (restricted.length === 0) return null;
  return (
    <details className="fx-restricted">
      <summary>
        {restricted.length} firm{restricted.length === 1 ? "" : "s"} hidden — their published country list includes where you live
      </summary>
      <ul>
        {restricted.map(({ firm, availability }) => (
          <li key={firm.id}>
            <Link href={`/funded-accounts/${firm.id}${query}`}>{firm.name}</Link>
            <p>
              {availability?.reason}
              {firm.countries?.lastChecked && ` Checked ${firm.countries.lastChecked}.`}
            </p>
            {firm.countries?.source && (
              <a href={firm.countries.source} target="_blank" rel="noopener noreferrer">
                Firm&apos;s list
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
          </li>
        ))}
      </ul>
    </details>
  );
}

export function CompareDock() {
  const { comparePlans, compareNote, compareHref, clearCompare, firms, toggleCompare, matching } = useFirms();
  if (comparePlans.length === 0) return null;
  return (
    <div className="tray-bottom fx-dock">
      <div className="container-page">
        <div className="fx-dock-bar">
          <p>Comparing</p>
          <ul>
            {comparePlans.map((plan) => {
              const firm = firms.find((f) => f.id === plan.firm);
              const row = matching.find((item) => item.firm.id === plan.firm);
              if (!firm || !row) return null;
              return (
                <li key={plan.firm}>
                  {firm.name}
                  <button type="button" onClick={() => toggleCompare(row)} aria-label={`Remove ${firm.name} from comparison`}>
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>
          {compareNote && <p role="status">{compareNote}</p>}
          {comparePlans.length < 2 ? (
            <p>Pick at least 2 to compare</p>
          ) : (
            <Link href={compareHref}>Compare ({comparePlans.length})</Link>
          )}
          <button type="button" onClick={clearCompare}>
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
