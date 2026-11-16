"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import FirmBadge from "@/components/FirmBadge";
import { MARKET_LABELS } from "@/components/PropFirmPricing";
import PropFirmNotes from "@/components/PropFirmNotes";
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

export default function RailView({ currencies }: { currencies: string[] }) {
  const { matching, query } = useFirms();
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 64rem)");
    const apply = () => setWide(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return (
    <div className="fx fx-rail">
      <aside className="fx-rail-side">
        <p className="fx-kicker">Prop firms</p>
        <h1>Funded Accounts</h1>
        <p className="fx-lede">Compare prop firm challenges side by side: price, rules and profit split.</p>
        <MarketSwitch stacked />
        <MatchLine />
        <details className="fx-rail-more" open={wide}>
          <summary>Filters, country and tools</summary>
          <FilterFields />
          <FilterChips />
          <CountryControl />
          <ToolLinks />
          <div className="fx-notes">
            <PropFirmNotes currencies={currencies} filterNote />
          </div>
        </details>
      </aside>
      <div className="fx-rail-list">
        {matching.length === 0 ? (
          <EmptyFirms />
        ) : (
          <ul>
            {matching.map((row) => (
              <li key={row.firm.id}>
                <FirmBadge name={row.firm.name} logo={row.firm.logo} logoBg={row.firm.logoBg} />
                <div className="fx-rail-name">
                  <h2>
                    <Link href={`/funded-accounts/${row.firm.id}${query}`}>{row.firm.name}</Link>
                  </h2>
                  <p>
                    {row.firm.markets.map((m) => MARKET_LABELS[m.market]).join(" · ")}
                  </p>
                  <FirmFlags row={row} />
                </div>
                <p className="fx-rail-price">
                  {row.priceLabel ?? "—"}
                  {row.cheapest?.monthly && <span> /month</span>}
                </p>
                <p className="fx-rail-fact">{row.maxSplit != null ? `${row.maxSplit}%` : "—"}</p>
                <p className="fx-rail-fact">{row.sizeText}</p>
                <p className="fx-rail-fact">{row.matches.length}</p>
                <FirmLinks row={row} />
              </li>
            ))}
          </ul>
        )}
        <RestrictedFirms />
      </div>
      <CompareDock />
    </div>
  );
}
