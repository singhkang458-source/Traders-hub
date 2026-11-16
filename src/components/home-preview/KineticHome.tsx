import Image from "next/image";
import Link from "next/link";
import CountUpStat from "@/components/CountUpStat";
import { StartHereMini } from "@/components/StartHerePath";
import { HOW_IT_WORKS, getHomePreview } from "@/lib/home-preview";
import { SectionFigure } from "./Figures";
import PreviewTail from "./Tail";
import SearchTrigger from "./SearchTrigger";

export default function KineticHome() {
  const home = getHomePreview();
  return (
    <div className="hx hx-spine">
      <h1 className="hx-spine-title">
        <span>Trading,</span>
        <span>decoded.</span>
      </h1>

      <div className="hx-spine-main">
        <header className="hx-spread-open">
          <p className="hx-kicker">
            <Image src="/brand/tradox-td.png" alt="" width={44} height={44} priority className="hx-mark" />
            UAE · Trading, simplified for everyone
          </p>
          <p className="hx-spread-lede">
            Prop firms, courses, signal groups, brokers, tools and strategies — real pricing, real rules, and live
            simulators you can practise on before you spend a cent.
          </p>
          <p className="hx-fine">{home.total}+ listings · zero performance scores · zero rankings</p>
          <SearchTrigger className="hx-word-search">Search</SearchTrigger>
        </header>

        <section id="explore" aria-labelledby="explore-heading">
          <div className="hx-band-head">
            <h2 id="explore-heading">Everything we offer</h2>
            <p>One site, seven ways to get your bearings — pick wherever you want to start. Scroll this band sideways.</p>
          </div>
          <div className="hx-band" tabIndex={0} role="region" aria-label="Sections, scroll sideways">
            {home.sections.map((section, i) => (
              <article key={section.slug} id={`hx-${section.slug}`}>
                <p className="hx-numeral" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <p className="hx-count">{section.count} listed</p>
                <h3>
                  <Link href={`/${section.slug}`}>{section.title}</Link>
                </h3>
                <p className="hx-blurb">{section.blurb}</p>
                <SectionFigure section={section} home={home} />
                <Link href={`/${section.slug}`} className="hx-text-link">
                  {section.cta}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <div className="hx-broken">
          <div className="hx-broken-nums">
            {home.stats.map((stat) => (
              <p key={stat.label}>
                <span className="hx-giant">
                  <CountUpStat value={stat.value} />
                </span>
                <span>{stat.label}</span>
              </p>
            ))}
          </div>
          <ol className="hx-broken-how" aria-label={`How ${home.siteName} works`}>
            {HOW_IT_WORKS.map((step, i) => (
              <li key={step.title}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <h2>{step.title}</h2>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>

        <section className="hx-start" aria-labelledby="start-here-heading">
          <p className="hx-kicker">Guided path</p>
          <h2 id="start-here-heading">New to trading?</h2>
          <p className="hx-lede">
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

        <PreviewTail />
      </div>
    </div>
  );
}
