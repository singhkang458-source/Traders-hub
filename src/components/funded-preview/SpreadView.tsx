"use client";

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
} from "./FirmBrowser";

export default function SpreadView({ currencies }: { currencies: string[] }) {
  const { matching, query } = useFirms();
  return (
    <div className="fx fx-spread">
      <header className="fx-spread-bar">
        <p className="fx-kicker">Prop firms</p>
        <h1>Funded Accounts</h1>
        <p>Compare prop firm challenges side by side: price, rules and profit split. One firm fills the screen. Scroll to the next.</p>
        <MatchLine />
        <MarketSwitch />
        <FilterChips />
      </header>
      {matching.length === 0 ? (
        <EmptyFirms />
      ) : (
        matching.map((row, index) => (
          <article key={row.firm.id} className="fx-spread-firm">
            <p className="fx-spread-index">
              {String(index + 1).padStart(2, "0")} / {String(matching.length).padStart(2, "0")}
            </p>
            <h2>
              <Link href={`/funded-accounts/${row.firm.id}${query}`}>{row.firm.name}</Link>
            </h2>
            <p className="fx-spread-markets">{row.firm.markets.map((m) => MARKET_LABELS[m.market]).join(" · ")}</p>
            <FirmFlags row={row} />
            <p className="fx-spread-price">
              {row.priceLabel ?? "—"}
              {row.cheapest?.monthly && <span> /month</span>}
            </p>
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
        ))
      )}
      <footer className="fx-spread-foot">
        <FilterFields />
        <CountryControl />
        <ToolLinks />
        <div className="fx-notes">
          <PropFirmNotes currencies={currencies} filterNote />
        </div>
        <RestrictedFirms />
      </footer>
      <CompareDock />
    </div>
  );
}
