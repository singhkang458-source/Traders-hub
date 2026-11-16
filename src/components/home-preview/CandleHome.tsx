import Image from "next/image";
import Link from "next/link";
import CountUpStat from "@/components/CountUpStat";
import { StartHereMini } from "@/components/StartHerePath";
import { FAQ, HOW_IT_WORKS, WHY_POINTS, getHomePreview } from "@/lib/home-preview";
import { SITE_NAME } from "@/lib/sections";
import FaqDetails from "@/components/FaqDetails";
import { SectionFigure } from "./Figures";
import SearchTrigger from "./SearchTrigger";

export default function CandleHome() {
  const home = getHomePreview();
  const max = Math.max(...home.sections.map((s) => s.count), 1);
  return (
    <div className="hx hx-trace">
      <div className="hx-trace-line" aria-hidden="true" />

      <section className="hx-event hx-event-open">
        <div className="hx-event-top">
          <p className="hx-kicker">
            <Image src="/brand/tradox-td.png" alt="" width={44} height={44} priority className="hx-mark" />
            UAE · Trading, simplified for everyone
          </p>
          <SearchTrigger className="hx-word-search">Search</SearchTrigger>
        </div>
        <h1>
          <span className="hx-open-candle" aria-hidden="true" />
          <span>Trading,</span>
          <span>decoded.</span>
        </h1>
        <div className="hx-event-foot">
          <p>
            Prop firms, courses, signal groups, brokers, tools and strategies — real pricing, real rules, and live
            simulators you can practise on before you spend a cent.
          </p>
          <p className="hx-fine">{home.total}+ listings · zero performance scores · zero rankings</p>
          <p className="hx-trace-note">You are moving along this page. The gold line is the path. It is not a price, and it is not a result.</p>
        </div>
      </section>

      <section className="hx-event" aria-label="Counts">
        <ol className="hx-trace-counts">
          {home.stats.map((stat) => (
            <li key={stat.label}>
              <span>
                <CountUpStat value={stat.value} />
              </span>
              <span>{stat.label}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="hx-event" aria-labelledby="how-heading">
        <h2 id="how-heading">How {home.siteName} works</h2>
        <ol className="hx-trace-how">
          {HOW_IT_WORKS.map((step, i) => (
            <li key={step.title}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="hx-event" aria-labelledby="start-here-heading">
        <p className="hx-kicker">Guided path</p>
        <h2 id="start-here-heading">New to trading? Start here.</h2>
        <p>
          Three stages in the right order: learn the basics, practise on a live chart, then understand funded-account
          rules before you ever pay a fee.
        </p>
        <StartHereMini />
        <ol className="hx-stage-col">
          {home.stages.map((stage, i) => (
            <li key={stage.href}>
              <span>Stage {i + 1}</span>
              <Link href={stage.href}>{stage.title}</Link>
              <p>
                {stage.steps} step{stage.steps === 1 ? "" : "s"}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="hx-event" aria-labelledby="explore-heading">
        <h2 id="explore-heading">Everything we offer</h2>
        <p>One site, seven ways to get your bearings — pick wherever you want to start.</p>
      </section>

      {home.sections.map((section, i) => (
        <section className="hx-event hx-event-section" key={section.slug} id={`hx-${section.slug}`} aria-labelledby={`sec-${section.slug}`}>
          <div className="hx-tick" aria-hidden="true">
            <span className={i % 2 ? "is-down" : "is-up"} style={{ height: `${28 + Math.round((section.count / max) * 72)}px` }} />
            <span>{section.count}</span>
          </div>
          <div>
            <p className="hx-count">{section.count} listed</p>
            <h2 id={`sec-${section.slug}`}>
              <Link href={`/${section.slug}`}>{section.title}</Link>
            </h2>
            <p>{section.blurb}</p>
            <SectionFigure section={section} home={home} />
            <p>
              <Link href={`/${section.slug}`}>{section.cta}</Link>
            </p>
          </div>
        </section>
      ))}

      <section className="hx-event" aria-labelledby="why-heading">
        <h2 id="why-heading">Why Tradox</h2>
        <p>The short version of how this site works and why we built it this way.</p>
        <ul className="hx-trace-why">
          {WHY_POINTS.map((point) => (
            <li key={point.title}>
              <h3>{point.title}</h3>
              <p>{point.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="hx-event" aria-labelledby="faq-heading">
        <h2 id="faq-heading">Questions people actually ask</h2>
        <FaqDetails items={FAQ} />
        <p>
          More detail in the <Link href="/disclaimer">full disclaimer</Link> and <Link href="/privacy">privacy policy</Link>.
        </p>
      </section>

      <section className="hx-event" aria-labelledby="close-heading">
        <h2 id="close-heading">Not sure where to start?</h2>
        <p>
          Try a free strategy first — it&apos;s the fastest way to see what {SITE_NAME} actually is before you dig into
          firms, courses or anything else.
        </p>
        <p>
          <Link href="/strategies">Start with a free strategy</Link>
        </p>
        <p>
          <Link href="/funded-accounts">Browse prop firms</Link>
        </p>
      </section>
    </div>
  );
}
