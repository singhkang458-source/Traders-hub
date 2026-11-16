import Image from "next/image";
import Link from "next/link";
import HeroSearchButton from "@/components/hero/HeroSearchButton";
import CountUpStat from "@/components/CountUpStat";
import { StartHereMini } from "@/components/StartHerePath";
import { HOW_IT_WORKS, getHomePreview } from "@/lib/home-preview";
import { SectionFigure } from "./Figures";
import PreviewTail from "./Tail";

export default function KineticHome() {
  const home = getHomePreview();
  return (
    <div className="hx hx-kinetic">
      <p className="hx-kicker">
        <Image src="/brand/tradox-td.png" alt="" width={44} height={44} priority className="hx-mark" />
        UAE · Trading, simplified for everyone
      </p>
      <h1>
        <span className="hx-k-word">Trading,</span>
        <span className="hx-k-word is-gold">decoded.</span>
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
      <dl className="hx-k-stats">
        {home.stats.map((stat) => (
          <div key={stat.label}>
            <dd>
              <CountUpStat value={stat.value} />
            </dd>
            <dt>{stat.label}</dt>
          </div>
        ))}
      </dl>
      <p className="hx-fine">{home.total}+ listings · zero performance scores · zero rankings</p>

      <section className="hx-how" aria-labelledby="how-heading">
        <h2 id="how-heading" className="sr-only">
          How {home.siteName} works
        </h2>
        <ol>
          {HOW_IT_WORKS.map((step, i) => (
            <li key={step.title}>
              <span className="hx-k-num" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
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
        <h2 id="start-here-heading" className="hx-k-word is-mid">
          Start here.
        </h2>
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

      <section id="explore" className="hx-explore" aria-labelledby="explore-heading">
        <h2 id="explore-heading" className="hx-k-word is-mid">
          Everything we offer
        </h2>
        <p className="hx-lede">One site, seven ways to get your bearings — pick wherever you want to start.</p>
        {home.sections.map((section) => (
          <article key={section.slug} id={`hx-${section.slug}`} className="hx-k-band">
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
      </section>

      <PreviewTail />
    </div>
  );
}
