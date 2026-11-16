"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import SaveButton from "@/components/SaveButton";
import ToolLogo from "@/components/ToolLogo";
import {
  TOOL_CATEGORY_LABELS,
  TOOL_CATEGORY_ORDER,
  toolPriceLabel,
  type ToolCategory,
  type ToolView,
} from "@/lib/tool-types";

export default function ToolDirectory({ tools }: { tools: ToolView[] }) {
  return (
    <Suspense fallback={<Directory tools={tools} initialQuery="" />}>
      <DirectoryFromAddress tools={tools} />
    </Suspense>
  );
}

function DirectoryFromAddress({ tools }: { tools: ToolView[] }) {
  const searchParams = useSearchParams();
  return <Directory tools={tools} initialQuery={searchParams.toString()} />;
}

function Directory({ tools, initialQuery }: { tools: ToolView[]; initialQuery: string }) {
  const params = new URLSearchParams(initialQuery);
  const initialCategory = params.get("category") ?? "all";
  const [category, setCategory] = useState<ToolCategory | "all">(
    isCategory(initialCategory) ? initialCategory : "all",
  );
  const [query, setQuery] = useState(params.get("q") ?? "");

  const counts = useMemo(() => {
    const map = new Map<ToolCategory, number>();
    for (const tool of tools) map.set(tool.category, (map.get(tool.category) ?? 0) + 1);
    return map;
  }, [tools]);

  const activeCategory: ToolCategory | "all" =
    category !== "all" && (counts.get(category) ?? 0) === 0 ? "all" : category;

  const matching = tools.filter((tool) => {
    if (activeCategory !== "all" && tool.category !== activeCategory) return false;
    return matchesQuery(tool, query);
  });

  function writeAddress(nextCategory: ToolCategory | "all", nextQuery: string) {
    const next = new URLSearchParams();
    if (nextCategory !== "all") next.set("category", nextCategory);
    const trimmed = nextQuery.trim();
    if (trimmed) next.set("q", trimmed);
    const qs = next.toString();
    window.history.replaceState(null, "", window.location.pathname + (qs ? `?${qs}` : ""));
  }

  function updateCategory(next: ToolCategory | "all") {
    setCategory(next);
    writeAddress(next, query);
  }

  function updateQuery(next: string) {
    setQuery(next);
    writeAddress(category, next);
  }

  const listingQuery = currentListingQuery(category, query);

  return (
    <div className="rack">
      <label className="rack-search">
        <span className="eyebrow">Search</span>
        <input
          type="search"
          value={query}
          onChange={(e) => updateQuery(e.target.value)}
          placeholder="Search by name, feature or platform"
          className="field"
        />
      </label>

      <div className="rack-keys" role="tablist" aria-label="Tool categories">
        <CategoryChip
          label="All"
          count={tools.length}
          pressed={activeCategory === "all"}
          onClick={() => updateCategory("all")}
        />
        {TOOL_CATEGORY_ORDER.filter((id) => (counts.get(id) ?? 0) > 0).map((id) => (
          <CategoryChip
            key={id}
            label={TOOL_CATEGORY_LABELS[id]}
            count={counts.get(id) ?? 0}
            pressed={activeCategory === id}
            onClick={() => updateCategory(id)}
          />
        ))}
      </div>

      <p aria-live="polite" className="rack-count">
        <span className="font-semibold text-foreground">{matching.length}</span> of {tools.length} shown
        {activeCategory !== "all" ? ` in ${TOOL_CATEGORY_LABELS[activeCategory]}` : ""}. Forex and gold tools stay at the top.
      </p>

      {matching.length === 0 ? (
        <p className="rack-empty">
          No tools match this search. Try another name, or clear the category.
        </p>
      ) : (
        <ul className="rack-bay">
          {matching.map((tool, index) => (
            <ToolCard key={tool.slug} tool={tool} index={index} listingQuery={listingQuery} />
          ))}
        </ul>
      )}
    </div>
  );
}

function CategoryChip({
  label,
  count,
  pressed,
  onClick,
}: {
  label: string;
  count: number;
  pressed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={pressed}
      onClick={onClick}
      className={`rack-key${pressed ? " is-down" : ""}`}
    >
      {label}
      <span className={`tabular-nums ${pressed ? "text-foreground" : "text-subtle"}`}>{count}</span>
    </button>
  );
}

function ToolCard({
  tool,
  index,
  listingQuery,
}: {
  tool: ToolView;
  index: number;
  listingQuery: string;
}) {
  const price = toolPriceLabel(tool);
  const href = listingQuery
    ? `/tools/${tool.slug}?back=${encodeURIComponent(listingQuery)}`
    : `/tools/${tool.slug}`;

  return (
    <li className="rack-unit">
      <span className="rack-screws" aria-hidden="true" />
      <div className="rack-screen">
        <ToolLogo name={tool.name} logo={tool.logo} priority={index < 2} />
      </div>
      <div className="rack-face">
        <div className="flex items-start gap-2">
          <h2 className="min-w-0 flex-1 text-base font-semibold tracking-tight text-foreground">
            <Link href={href} className="card-stretch rack-name">
              {tool.name}
            </Link>
          </h2>
          <div className="relative z-10 shrink-0">
            <SaveButton kind="tool" id={tool.slug} name={tool.name} />
          </div>
        </div>
        <p className="rack-cat">{TOOL_CATEGORY_LABELS[tool.category]}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">{tool.description}</p>
        <Link href={href} className="rack-view relative z-10">
          View
          <span className="sr-only"> {tool.name}</span>
          <span aria-hidden="true"> →</span>
        </Link>
      </div>
      <dl className="rack-readout">
        <div>
          <dt>Price from</dt>
          <dd>{price ?? "Not listed"}</dd>
        </div>
        {tool.platforms.length > 0 && (
          <div>
            <dt>Platforms</dt>
            <dd>{tool.platforms.join(", ")}</dd>
          </div>
        )}
      </dl>
    </li>
  );
}

function isCategory(value: string): value is ToolCategory {
  return value in TOOL_CATEGORY_LABELS;
}

function matchesQuery(tool: ToolView, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const haystack = [
    tool.name,
    tool.description,
    TOOL_CATEGORY_LABELS[tool.category],
    ...tool.features,
    ...tool.platforms,
    ...tool.plans.map((plan) => `${plan.name} ${plan.price}`),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
}

function currentListingQuery(category: ToolCategory | "all", query: string): string {
  const next = new URLSearchParams();
  if (category !== "all") next.set("category", category);
  const trimmed = query.trim();
  if (trimmed) next.set("q", trimmed);
  return next.toString();
}
