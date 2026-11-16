import Image from "next/image";
import Link from "next/link";
import HeroSearchButton from "@/components/hero/HeroSearchButton";
import CountUpStat from "@/components/CountUpStat";
import { StartHereMini } from "@/components/StartHerePath";
import { HOW_IT_WORKS, getHomePreview, type HomeSectionPreview } from "@/lib/home-preview";
import { SectionFigure } from "./Figures";
import PreviewTail from "./Tail";

function Candle({ section, index, max }: { section: HomeSectionPreview; index: number; max: number }) {
  const down = index % 2 === 1;
  const body = 28 + Math.round((section.count / max) * 92);
  const wick = 18;
  return (
    <a className={`hx-candle ${down ? "is-down" : "is-up"}`} href={`#hx-${section.slug}`}>
      <span className="hx-candle-name">{section.title}</span>
      <span className="hx-candle-draw" aria-hidden="true">
        <span className="hx-candle-wick" style={{ height: wick }} />
        <span className="hx-candle-body" style={{ height: body }} />
        <span className="hx-candle-wick" style={{ height: wick + (down ? 10 : 4) }} />
      </span>
      <span className="hx-candle-count">{section.count}</span>
    </a>
  );
}

export default function CandleHome() {
  const home = getHomePreview();
  const max = Math.max(...home.sections.map((s) => s.count), 1);
  return (
    <div className="hx hx-candle-page">
      <header className="hx-print">
        <p className="hx-kicker">
          <Image src="/brand/tradox-td.png" alt="" width={44} height={44} priority className="hx-mark" />
          UAE · Trading, simplified for everyone
        </p>
        <p className="hx-print-label">Page title. Not a price, and not a result.</p>
        <h1>
          <span>Trading,</span>
          <span>decoded.</span>
        </h1>
        <p className="hx-lede">
          Prop firms, courses, signal groups, brokers, tools and strategies — real pricing, real rules, and live
          simulators you can practise on before you spend a cent.
        </p>
        <div className="hx-search">
          <HeroSearchButton />
        </div>
        <div className="hx-actions">
          <Link href="/start-here" className="hx-btn is-fill">
            New to trading? Start here
          </Link>
          <Link href="/funded-accounts" className="hx-btn">
            Browse prop firms
          </Link>
        </div>
        <dl className="hx-c-stats">
          {home.stats.map((stat) => (
            <div key={stat.label}>
              <dt>{stat.label}</dt>
              <dd>
                <CountUpStat value={stat.value} />
              </dd>
            </div>
          ))}
        </dl>
        <p className="hx-fine">{home.total}+ listings · zero performance scores · zero rankings</p>
      </header>

      <section className="hx-how" aria-labelledby="how-heading">
        <h2 id="how-heading">How {home.siteName} works</h2>
        <ol>
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

      <section className="hx-start" aria-labelledby="start-here-heading">
        <p className="hx-kicker">Guided path</p>
        <h2 id="start-here-heading">New to trading? Start here.</h2>
        <p className="hx-lede">
          Three stages in the right order: learn the basics, practise on a live chart, then understand funded-account
          rules before you ever pay a fee.
        </p>
        <StartHereMini />
        <ol className="hx-stages">
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

      <section id="explore" className="hx-pit" aria-labelledby="explore-heading">
        <div className="hx-pit-board">
          <h2 id="explore-heading">Everything we offer</h2>
          <p className="hx-lede">One site, seven ways to get your bearings — pick wherever you want to start.</p>
          <p className="hx-candle-note">
            Each bar is a section of this page. The height is how many listings that section has. It is not a price,
            and it is not a result.
          </p>
          <div className="hx-candles">
            {home.sections.map((section, i) => (
              <Candle key={section.slug} section={section} index={i} max={max} />
            ))}
          </div>
        </div>
        <div className="hx-pit-read">
          {home.sections.map((section) => (
            <article key={section.slug} id={`hx-${section.slug}`}>
              <p className="hx-count">{section.count} listed</p>
              <h3>
                <Link href={`/${section.slug}`}>{section.title}</Link>
              </h3>
              <p className="hx-blurb">{section.blurb}</p>
              <SectionFigure section={section} home={home} />
              <Link href={`/${section.slug}`} className="hx-btn">
                {section.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <PreviewTail />
    </div>
  );
}
