import Link from "next/link";
import {
  BROKER_CATEGORY_LABELS,
  BROKER_CATEGORY_ORDER,
  BROKER_CATEGORY_PATHS,
  type BrokerCategory,
} from "@/lib/broker-types";

/** Three-position desk switch. CFD, stocks and crypto stay separate addresses. */
export default function BrokerCategoryNav({ active }: { active: BrokerCategory }) {
  return (
    <nav aria-label="Broker types" className="broker-switch">
      <ul className="broker-switch-list">
        {BROKER_CATEGORY_ORDER.map((id) => {
          const selected = id === active;
          return (
            <li key={id}>
              <Link
                href={BROKER_CATEGORY_PATHS[id]}
                aria-current={selected ? "page" : undefined}
              >
                {BROKER_CATEGORY_LABELS[id]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
