"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PropFirmNotes from "@/components/PropFirmNotes";
import { MARKET_LABELS } from "@/components/PropFirmPricing";
import {
  CompareDock,
  CountryControl,
  EmptyFirms,
  FilterChips,
  FilterFields,
  FirmFlags,
  FirmLinks,
  MarketSwitch,
  MatchLine,
  RestrictedFirms,
  ToolLinks,
  useFirms,
  type FirmRow,
} from "./FirmBrowser";

export default function StripView({ currencies }: { currencies: string[] }) {
  const { matching, query } = useFirms();
  const [index, setIndex] = useState(0);
  const last = Math.max(matching.length - 1, 0);
  const safe = Math.min(index, last);

  useEffect(() => {
    setIndex((current) => Math.min(current, last));
  }, [last]);

  function move(dir: -1 | 1) {
    setIndex((current) => Math.min(last, Math.max(0, Math.min(current, last) + dir)));
  }

  return (
    <div className="fx fx-strip">
      <div className="fx-strip-top">
        <p className="fx-kicker">Prop firms</p>
        <h1>Funded Accounts</h1>
        <MatchLine />
        <div className="fx-strip-move">
          <button type="button" onClick={() => move(-1)}>
            Previous firm
          </button>
          <button type="button" onClick={() => move(1)}>
            Next firm
          </button>
        </div>
      </div>
      <MarketSwitch />
      <FilterFields />
      <FilterChips />
      {matching.length === 0 ? (
        <EmptyFirms />
      ) : (
        <div
          className="fx-strip-stage"
          tabIndex={0}
          role="region"
          aria-label="Firms, use the arrows to move"
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") move(1);
            if (e.key === "ArrowLeft") move(-1);
          }}
        >
          <FirmPanel row={matching[safe]} place={`${safe + 1} / ${matching.length}`} query={query} />
          {matching[safe + 1] && (
            <div className="fx-strip-peek" aria-hidden="true">
              <p>{safe + 2} / {matching.length}</p>
              <p>{matching[safe + 1].firm.name}</p>
            </div>
          )}
        </div>
      )}
      <p className="fx-strip-note">Move to the next firm. Each stop is one firm. This is a directory, not a price chart and not a result.</p>
      <CountryControl />
      <ToolLinks />
      <div className="fx-notes">
        <PropFirmNotes currencies={currencies} filterNote />
      </div>
      <RestrictedFirms />
      <CompareDock />
    </div>
  );
}

function FirmPanel({ row, place, query }: { row: FirmRow; place: string; query: string }) {
  return (
    <article>
      <p className="fx-spread-index">{place}</p>
      <h2>
        <Link href={`/funded-accounts/${row.firm.id}${query}`}>{row.firm.name}</Link>
      </h2>
      <p className="fx-spread-price">
        {row.priceLabel ?? "—"}
        {row.cheapest?.monthly && <span> /month</span>}
      </p>
      <p className="fx-spread-markets">{row.firm.markets.map((m) => MARKET_LABELS[m.market]).join(" · ")}</p>
      <FirmFlags row={row} />
      <dl>
        <div>
          <dt>Max split</dt>
          <dd>{row.maxSplit != null ? `${row.maxSplit}%` : "—"}</dd>
        </div>
        <div>
          <dt>Sizes</dt>
          <dd>{row.sizeText}</dd>
        </div>
        <div>
          <dt>Accounts</dt>
          <dd>{row.matches.length}</dd>
        </div>
      </dl>
      <FirmLinks row={row} />
    </article>
  );
}
