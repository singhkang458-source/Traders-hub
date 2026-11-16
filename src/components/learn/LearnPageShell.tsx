import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeftIcon } from "@/components/icons";
import TrackView from "@/components/TrackView";
import MarkDoneButton from "@/components/MarkDoneButton";
import { LEARN_TOPICS, learnTopicIndex, type LearnTopic } from "@/lib/learn-topics";

// The shared shell every /learn/<slug> page wraps its content in — a calm
// reading column, an in-page jump list, and a prev/next step through the
// 9-part course.
export default function LearnPageShell({
  topic,
  toc,
  children,
}: {
  topic: LearnTopic;
  toc: { id: string; label: string }[];
  children: ReactNode;
}) {
  const index = learnTopicIndex(topic.slug);
  const prev = index > 0 ? LEARN_TOPICS[index - 1] : null;
  const next = index < LEARN_TOPICS.length - 1 ? LEARN_TOPICS[index + 1] : null;
  const Icon = topic.icon;

  return (
    <div className="lesson">
      <TrackView kind="learn" id={topic.slug} />
      <Link href="/learn" className="back-link">
        <ChevronLeftIcon className="size-4" />
        Back to Learn
      </Link>

      <header className="lesson-head">
        <p className="eyebrow flex flex-wrap items-center gap-x-3 gap-y-1">
          <Icon className="size-4 text-accent" aria-hidden="true" />
          <span>
            Part {index + 1} of {LEARN_TOPICS.length}
          </span>
          <span>{topic.readMinutes} min read</span>
        </p>
        <h1 className="page-title mt-3 max-w-3xl">{topic.title}</h1>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted">{topic.summary}</p>
      </header>

      <div className="lesson-layout">
        {toc.length > 0 && (
          <nav className="lesson-toc" aria-label="Jump to section">
            <p className="lesson-toc-label">On this page</p>
            <ol>
              {toc.map((item, i) => (
                <li key={item.id}>
                  <a href={`#${item.id}`}>
                    <span className="lesson-toc-num" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className="lesson-read">
          <div className="space-y-12">{children}</div>

          <div className="lesson-done">
            <MarkDoneButton kind="learn" id={topic.slug} label="Mark this part as done" doneLabel="Part done" />
            <p className="meta">
              Part {index + 1} of {LEARN_TOPICS.length}. Ticks show on the Learn page, the Start here path and My Hub.
            </p>
          </div>

          <p className="meta mt-10 border-t border-border pt-6">
            This page explains general trading concepts for learning purposes only — it is not
            financial advice and not a recommendation to trade any particular market or instrument.
            See the full{" "}
            <Link href="/disclaimer" className="text-accent hover:underline">
              disclaimer
            </Link>
            .
          </p>

          <nav className="lesson-turn" aria-label="Other parts">
            {prev ? (
              <Link href={`/learn/${prev.slug}`}>
                <span className="meta block">Previous</span>
                <span className="mt-1 block font-semibold text-foreground">{prev.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/learn/${next.slug}`} className="sm:text-right">
                <span className="meta block">Next</span>
                <span className="mt-1 block font-semibold text-foreground">{next.title}</span>
              </Link>
            ) : (
              <Link href="/learn" className="sm:text-right">
                <span className="meta block">That&apos;s the whole course</span>
                <span className="mt-1 block font-semibold text-foreground">Back to Learn overview</span>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
}
