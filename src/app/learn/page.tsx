import type { Metadata } from "next";
import Link from "next/link";
import { getSection } from "@/lib/sections";
import { LEARN_TOPICS } from "@/lib/learn-topics";
import { DoneTick, ProgressSummary } from "@/components/ProgressBits";

const section = getSection("learn");
const totalMinutes = LEARN_TOPICS.reduce((sum, t) => sum + t.readMinutes, 0);

export const metadata: Metadata = {
  title: section.title,
  description: section.summary,
};

export default function LearnPage() {
  return (
    <div>
      <header className="lesson-open">
        <p className="eyebrow">{section.title}</p>
        <h1 className="page-title mt-2 max-w-3xl">
          Start here if you&apos;re <span className="lesson-emphasis">new</span> to trading
        </h1>
        <p className="lesson-lede">
          A 9-part walkthrough of everything a beginner actually needs: what you can trade, how
          orders work, reading a chart, timeframes, analysis, risk, psychology and costs. No
          account, no email, free. Go in order or jump straight to what you need.
        </p>
        <dl className="lesson-facts">
          <div>
            <dt>Parts</dt>
            <dd>{LEARN_TOPICS.length}</dd>
          </div>
          <div>
            <dt>Minutes, start to finish</dt>
            <dd>{totalMinutes}</dd>
          </div>
          <div>
            <dt>Quick-check quizzes</dt>
            <dd>{LEARN_TOPICS.length}</dd>
          </div>
          <div>
            <dt>Account needed</dt>
            <dd>0</dd>
          </div>
        </dl>
        <p className="lesson-note">Every part is free and open — no signup wall, no paid tier.</p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link href={`/learn/${LEARN_TOPICS[0].slug}`} className="btn btn-primary">
            Start with part 1
          </Link>
          <Link href="/strategies" className="btn btn-outline">
            Already know the basics? Try a strategy
          </Link>
        </div>
      </header>

      <div className="mt-12">
        <h2 className="section-title text-2xl sm:text-3xl">The 9 parts</h2>
        <ProgressSummary kind="learn" ids={LEARN_TOPICS.map((t) => t.slug)} noun="parts" className="mt-4 max-w-xl" />
        <p className="mt-2 max-w-xl text-muted">
          Built to go in order, but every part stands on its own if you already know the earlier ones.
        </p>

        <ol className="lesson-rail">
          {LEARN_TOPICS.map((topic, i) => {
            const Icon = topic.icon;
            return (
              <li key={topic.slug}>
                <Link href={`/learn/${topic.slug}`} className="lesson-stop">
                  <span className="lesson-stop-num" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <Icon className="size-4 shrink-0 text-accent" aria-hidden="true" />
                      <span className="text-lg font-bold text-foreground">{topic.title}</span>
                      <DoneTick kind="learn" id={topic.slug} />
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted">{topic.summary}</span>
                    <span className="meta mt-2 block">{topic.readMinutes} min</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
