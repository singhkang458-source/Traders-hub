import { BROKER_CATEGORY_LABELS, type BrokerCategory } from "@/lib/broker-types";

const COMING_SOON: Record<Exclude<BrokerCategory, "cfd">, string> = {
  stocks:
    "Stock broker listings are on the way. None are published here yet, and this tab will stay empty until a real broker is added.",
  crypto:
    "Crypto exchange listings are on the way. None are published here yet, and this tab will stay empty until a real exchange is added.",
};

export default function BrokerCategoryEmpty({ category }: { category: BrokerCategory }) {
  if (category === "cfd") {
    return <p className="broker-desk-empty-note">No CFD brokers are listed.</p>;
  }

  return (
    <div className="broker-desk-empty">
      <div className="broker-desk-empty-rules" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="broker-desk-empty-copy">
        <p className="eyebrow">Coming soon</p>
        <h2 className="broker-heading mt-3 text-3xl font-semibold tracking-tight text-foreground">
          {BROKER_CATEGORY_LABELS[category]}
        </h2>
        <p className="mt-3 max-w-md text-base leading-7 text-muted">{COMING_SOON[category]}</p>
      </div>
    </div>
  );
}
