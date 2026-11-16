import Link from "next/link";
import BrokerLogo from "@/components/BrokerLogo";
import OurChoiceBadge from "@/components/OurChoiceBadge";
import SaveButton from "@/components/SaveButton";
import VisitSiteLink from "@/components/VisitSiteLink";
import { cardFacts } from "@/lib/broker-facts";
import { brokerOutboundUrl, type BrokerView } from "@/lib/broker-types";

/**
 * One dealing desk, not two cards. VT Markets sits on the left because it is
 * Our choice. Each fact is one row you read across.
 * The visit button uses the listing's affiliate link.
 */
export default function CfdBrokerPair({ brokers }: { brokers: BrokerView[] }) {
  if (brokers.length === 0) return null;
  const labels = cardFacts(brokers[0]).map((fact) => fact.label);
  const columns = brokers.map((broker) => ({
    broker,
    facts: new Map(cardFacts(broker).map((fact) => [fact.label, fact.value])),
  }));

  return (
    <div className="broker-desk">
      <div className="broker-desk-heads">
        {columns.map(({ broker }, index) => (
          <DeskHead key={broker.id} broker={broker} priority={index === 0} />
        ))}
        {columns.length > 1 && <div className="broker-desk-spine" aria-hidden="true" />}
      </div>
      <dl className="broker-desk-rows">
        {labels.map((label) => (
          <div key={label} className="broker-desk-row">
            <dt>{label}</dt>
            {columns.map(({ broker, facts }) => (
              <dd key={broker.id}>
                <span className="sr-only">{broker.name}: </span>
                {facts.get(label) ?? "Not listed"}
              </dd>
            ))}
          </div>
        ))}
      </dl>
    </div>
  );
}

function DeskHead({ broker, priority }: { broker: BrokerView; priority: boolean }) {
  const visitHref = brokerOutboundUrl(broker);
  return (
    <article className={`broker-desk-head${broker.ourChoice ? " is-choice" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <BrokerLogo name={broker.name} logo={broker.logo} logoBg={broker.logoBg} size="sm" priority={priority} />
        <SaveButton kind="broker" id={broker.id} name={broker.name} />
      </div>
      {broker.ourChoice && (
        <div className="mt-3">
          <OurChoiceBadge compact />
        </div>
      )}
      <h2 className="broker-heading mt-4 text-[1.35rem] font-semibold leading-tight tracking-tight text-foreground sm:text-2xl">
        <Link href={`/brokers/${broker.id}`} className="broker-desk-name">
          {broker.name}
        </Link>
      </h2>
      {broker.tagline && <p className="mt-2 text-sm leading-6 text-muted">{broker.tagline}</p>}
      <div className="broker-desk-actions mt-5 flex flex-col gap-1">
        {visitHref && <VisitSiteLink href={visitHref} firmName={broker.name} label="Visit broker" className="w-full" />}
        <Link
          href={`/brokers/${broker.id}`}
          className="flex min-h-11 items-center justify-center text-sm font-medium text-muted hover:text-foreground"
        >
          View listing
          <span className="sr-only"> for {broker.name}</span>
        </Link>
      </div>
    </article>
  );
}
