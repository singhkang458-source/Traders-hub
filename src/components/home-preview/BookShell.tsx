"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import CountUpStat from "@/components/CountUpStat";
import { StartHereMini } from "@/components/StartHerePath";
import { FAQ, HOW_IT_WORKS, WHY_POINTS } from "@/lib/home-copy";
import type { HomePreview } from "@/lib/home-preview";
import { SITE_NAME } from "@/lib/sections";
import FaqDetails from "@/components/FaqDetails";
import { SectionFigure } from "./Figures";
import SearchTrigger from "./SearchTrigger";

export default function BookShell({ home }: { home: HomePreview }) {
  const [open, setOpen] = useState<string | null>("intro");
  const [mobilePane, setMobilePane] = useState(false);
  const paneRef = useRef<HTMLDivElement>(null);

  function choose(id: string) {
    setOpen(id);
    setMobilePane(true);
    window.requestAnimationFrame(() => paneRef.current?.focus());
  }

  const active = open ?? "intro";

  return (
    <div className={`hx hx-book ${mobilePane ? "is-open" : ""}`}>
      <div className="hx-book-chrome">
        <p className="hx-book-title">
          <Image src="/brand/tradox-td.png" alt="" width={28} height={28} priority className="hx-mark" />
          <span>TRADOX</span>
        </p>
        <h1>Trading, decoded.</h1>
        <SearchTrigger className="hx-prompt">
          <span aria-hidden="true">&gt;</span>
          <span>search</span>
          <span className="hx-caret" aria-hidden="true" />
        </SearchTrigger>
      </div>

      <div className="hx-book-frame">
        <div className="hx-book-list" role="tablist" aria-label="Open a section" aria-orientation="vertical">
          {rows(home).map((row, i) => (
            <button
              key={row.id}
              type="button"
              role="tab"
              id={`tab-${row.id}`}
              aria-selected={active === row.id}
              aria-controls="book-pane"
              onClick={() => choose(row.id)}
            >
              <span>{String(i).padStart(2, "0")}</span>
              <span>{row.label}</span>
              <span>{row.meta}</span>
            </button>
          ))}
        </div>

        <div
          className="hx-book-pane"
          id="book-pane"
          role="tabpanel"
          aria-labelledby={`tab-${active}`}
          tabIndex={-1}
          ref={paneRef}
        >
          <button type="button" className="hx-book-back" onClick={() => setMobilePane(false)}>
            Back to the book
          </button>
          <PaneBody id={active} home={home} />
        </div>
      </div>

      <p className="hx-book-status">
        {home.stats.map((stat) => (
          <span key={stat.label}>
            {stat.label} <CountUpStat value={stat.value} />
          </span>
        ))}
        <span>{home.total}+ listings</span>
        <span>zero scores</span>
      </p>
    </div>
  );
}

function rows(home: HomePreview): { id: string; label: string; meta: string }[] {
  return [
    { id: "intro", label: "DECODED", meta: "OPEN" },
    { id: "how", label: "HOW", meta: "03" },
    { id: "start", label: "START", meta: "PATH" },
    ...home.sections.map((section) => ({
      id: section.slug,
      label: section.title.toUpperCase(),
      meta: String(section.count),
    })),
    { id: "why", label: "WHY", meta: "04" },
    { id: "faq", label: "ASK", meta: "05" },
    { id: "close", label: "BEGIN", meta: "GO" },
  ];
}

function PaneBody({ id, home }: { id: string; home: HomePreview }) {
  if (id === "intro") {
    return (
      <article>
        <p className="hx-kicker">UAE · Trading, simplified for everyone</p>
        <p className="hx-book-lead">Trading, decoded.</p>
        <p>
          Prop firms, courses, signal groups, brokers, tools and strategies — real pricing, real rules, and live
          simulators you can practise on before you spend a cent.
        </p>
        <p className="hx-fine">{home.total}+ listings · zero performance scores · zero rankings</p>
        <p>
          <Link href="/funded-accounts">Browse prop firms</Link>
        </p>
      </article>
    );
  }
  if (id === "how") {
    return (
      <article>
        <h2>How {SITE_NAME} works</h2>
        <ol className="hx-book-lines">
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
      </article>
    );
  }
  if (id === "start") {
    return (
      <article>
        <h2 id="start-here-heading">New to trading? Start here.</h2>
        <p>
          Three stages in the right order: learn the basics, practise on a live chart, then understand funded-account
          rules before you ever pay a fee.
        </p>
        <StartHereMini />
        <ol className="hx-book-lines">
          {home.stages.map((stage, i) => (
            <li key={stage.href}>
              <span>0{i + 1}</span>
              <div>
                <Link href={stage.href}>{stage.title}</Link>
                <p>
                  {stage.steps} step{stage.steps === 1 ? "" : "s"}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </article>
    );
  }
  const section = home.sections.find((s) => s.slug === id);
  if (section) {
    return (
      <article id={`hx-${section.slug}`}>
        <p className="hx-count">{section.count} listed</p>
        <h2>
          <Link href={`/${section.slug}`}>{section.title}</Link>
        </h2>
        <p>{section.blurb}</p>
        <SectionFigure section={section} home={home} />
        <p>
          <Link href={`/${section.slug}`}>{section.cta}</Link>
        </p>
      </article>
    );
  }
  if (id === "why") {
    return (
      <article>
        <h2 id="why-heading">Why Tradox</h2>
        <p>The short version of how this site works and why we built it this way.</p>
        <ul className="hx-book-lines">
          {WHY_POINTS.map((point) => (
            <li key={point.title}>
              <div>
                <h3>{point.title}</h3>
                <p>{point.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </article>
    );
  }
  if (id === "faq") {
    return (
      <article>
        <h2 id="faq-heading">Questions people actually ask</h2>
        <FaqDetails items={FAQ} />
        <p>
          More detail in the <Link href="/disclaimer">full disclaimer</Link> and <Link href="/privacy">privacy policy</Link>.
        </p>
      </article>
    );
  }
  return (
    <article>
      <h2 id="close-heading">Not sure where to start?</h2>
      <p>
        Try a free strategy first — it&apos;s the fastest way to see what {SITE_NAME} actually is before you dig into
        firms, courses or anything else.
      </p>
      <p>
        <Link href="/strategies">Start with a free strategy</Link>
        {" · "}
        <Link href="/start-here">New to trading? Start here</Link>
      </p>
    </article>
  );
}
