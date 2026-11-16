import Link from "next/link";
import FaqDetails from "@/components/FaqDetails";
import { FAQ, WHY_POINTS } from "@/lib/home-preview";
import { SITE_NAME } from "@/lib/sections";

export default function PreviewTail() {
  return (
    <>
      <section className="hx-why" aria-labelledby="why-heading">
        <h2 id="why-heading">Why Tradox</h2>
        <p className="hx-dek">The short version of how this site works and why we built it this way.</p>
        <ul>
          {WHY_POINTS.map((point) => (
            <li key={point.title}>
              <p className="hx-why-title">{point.title}</p>
              <p>{point.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="hx-faq" aria-labelledby="faq-heading">
        <h2 id="faq-heading">Questions people actually ask</h2>
        <div className="hx-faq-slot">
          <FaqDetails items={FAQ} />
        </div>
        <p className="hx-dek">
          More detail in the <Link href="/disclaimer">full disclaimer</Link> and <Link href="/privacy">privacy policy</Link>.
        </p>
      </section>

      <section className="hx-close" aria-labelledby="close-heading">
        <h2 id="close-heading">Not sure where to start?</h2>
        <p>
          Try a free strategy first — it&apos;s the fastest way to see what {SITE_NAME} actually is before you dig into
          firms, courses or anything else.
        </p>
        <Link href="/strategies" className="hx-btn">
          Start with a free strategy
        </Link>
      </section>
    </>
  );
}
