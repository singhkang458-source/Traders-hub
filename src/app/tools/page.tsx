import type { Metadata } from "next";
import ToolDirectory from "@/components/ToolDirectory";
import { getSection } from "@/lib/sections";
import { TOOL_CATEGORY_ORDER } from "@/lib/tool-types";
import { tools } from "@/lib/tools";

const section = getSection("tools");

export const metadata: Metadata = {
  title: section.title,
  description: section.summary,
};

const faqs = [
  {
    q: "Do you rank tools by results?",
    a: "No. This is a directory. We do not score accuracy, returns or how often a tool's users make money. The order puts forex and gold tools first, then the rest by name.",
  },
  {
    q: "Why is a price missing?",
    a: "We only print a price we could read on the tool's own site. If the page was blocked, promotional, or showed figures we could not match to a plan, the price is left blank. Check the provider before you pay.",
  },
  {
    q: "Where does Visit tool go?",
    a: "It opens that tool through our affiliate link, and we may earn a commission if you sign up or buy. The footer says the same. Every tool on this page has one of those links.",
  },
];

export default function ToolsPage() {
  const categoryCount = TOOL_CATEGORY_ORDER.filter((id) => tools.some((tool) => tool.category === id)).length;

  return (
    <div className="rack-page">
      <header className="rack-mast">
        <p className="eyebrow">Trading tools</p>
        <h1 className="page-title mt-2">{section.title}</h1>
        <p className="rack-lede">
          Compare charting, indicators, backtesting, scanners, automation, trade copiers and VPS hosts side by side.
        </p>
        <dl className="rack-status">
          <div>
            <dt>Tools listed</dt>
            <dd>{tools.length}</dd>
          </div>
          <div>
            <dt>Categories</dt>
            <dd>{categoryCount}</dd>
          </div>
          <div>
            <dt>Trading results</dt>
            <dd>Not scored</dd>
          </div>
        </dl>
        <p className="meta mt-4 max-w-2xl">
          Descriptions are in our own words. Prices are copied from each provider&apos;s site on the date
          in that listing, and a blank price means we could not confirm one. Fees change, and taxes may
          be added at checkout.
        </p>
      </header>

      <div className="mt-8">
        <ToolDirectory tools={tools} />
      </div>

      <section aria-labelledby="tool-faq-heading" className="rack-faq">
        <h2 id="tool-faq-heading" className="section-title">
          How to read this page
        </h2>
        <div className="mt-4">
          {faqs.map((item) => (
            <details key={item.q} className="group border-t border-border py-3 last:border-b">
              <summary className="flex min-h-11 cursor-pointer list-none items-center font-medium text-foreground [&::-webkit-details-marker]:hidden">
                <span className="flex w-full items-center justify-between gap-4">
                  {item.q}
                  <span aria-hidden="true" className="rack-faq-mark text-muted">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
