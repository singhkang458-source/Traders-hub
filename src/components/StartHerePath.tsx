"use client";

import Link from "next/link";
import { useProgress } from "@/lib/progress-store";
import { START_HERE_PATH, START_HERE_TRACKED, type PathStage } from "@/lib/start-here";
import { CheckIcon, ChevronRightIcon, CompassIcon, PlayIcon, ShieldIcon } from "@/components/icons";

// The guided path, drawn as three connected stages. Ticks come from the
// browser-side progress store (and the account, once signed in and synced).

const STAGE_ICON = { learn: CompassIcon, practice: PlayIcon, funded: ShieldIcon } as const;

function useDoneSet() {
  const progress = useProgress();
  return new Set(progress.map((e) => `${e.kind}:${e.id}`));
}

export function useStartHereProgress() {
  const done = useDoneSet();
  const completed = START_HERE_TRACKED.filter((s) => done.has(`${s.progress!.kind}:${s.progress!.id}`)).length;
  return { completed, total: START_HERE_TRACKED.length, done };
}

export default function StartHerePath() {
  const { completed, total, done } = useStartHereProgress();
  const pct = total ? Math.round((completed / total) * 100) : 0;

  // The first unticked tracked step is where "Continue" points.
  const next = START_HERE_TRACKED.find((s) => !done.has(`${s.progress!.kind}:${s.progress!.id}`)) ?? null;

  return (
    <div className="trail-wrap">
      <div className="trail-now">
        <div className="min-w-0 flex-1">
          <p className="eyebrow">Your progress</p>
          <p className="mt-1 text-lg font-semibold text-foreground" aria-live="polite">
            {completed === 0
              ? "Nothing ticked yet — start with part 1 below."
              : completed === total
                ? "Every tracked step is done. Nice."
                : `${completed} of ${total} tracked steps done`}
          </p>
          <div className="mt-3 h-2 w-full overflow-hidden bg-surface-2" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={completed} aria-label="Start here progress">
            <div className="path-progress h-full bg-gold-fill" style={{ width: `${pct}%` }} />
          </div>
          <p className="meta mt-2">Saved in this browser. Create a free account, or sign in, to keep it across devices.</p>
        </div>
        {next && (
          <Link href={next.href} className="btn btn-primary mt-4 shrink-0 sm:mt-0">
            {completed === 0 ? "Start" : "Continue"}: {next.title}
            <ChevronRightIcon className="size-4" />
          </Link>
        )}
      </div>

      <ol className="trail">
        {START_HERE_PATH.map((stage, i) => (
          <Stage key={stage.id} stage={stage} index={i} done={done} />
        ))}
      </ol>
    </div>
  );
}

function Stage({ stage, index, done }: { stage: PathStage; index: number; done: Set<string> }) {
  const Icon = STAGE_ICON[stage.id];
  const tracked = stage.steps.filter((s) => s.progress);
  const ticked = tracked.filter((s) => done.has(`${s.progress!.kind}:${s.progress!.id}`)).length;
  const stageDone = tracked.length > 0 && ticked === tracked.length;

  return (
    <li className={`trail-stage${stageDone ? " is-done" : ""}`}>
      <p className="eyebrow flex items-center gap-2">
        {stageDone ? <CheckIcon className="size-4 text-success" aria-hidden="true" /> : <Icon className="size-4 text-accent" aria-hidden="true" />}
        {stage.eyebrow}
      </p>
      <h2 className="section-title mt-2 text-2xl">
        <Link href={stage.href} className="hover:text-accent">
          {stage.title}
        </Link>
      </h2>
      <p className="mt-2 text-muted">{stage.blurb}</p>
      {tracked.length > 0 && (
        <p className="meta mt-2">
          {ticked} of {tracked.length} done
        </p>
      )}

      <ol className="trail-steps">
        {stage.steps.map((step, j) => {
          const isDone = step.progress ? done.has(`${step.progress.kind}:${step.progress.id}`) : false;
          return (
            <li key={step.href}>
              <Link href={step.href} className="trail-step">
                <span
                  aria-hidden="true"
                  className={`trail-mark${isDone ? " is-done" : ""}`}
                >
                  {isDone ? <CheckIcon className="size-3.5" /> : j + 1}
                </span>
                <span className="min-w-0">
                  <span className={`block font-semibold ${isDone ? "text-muted line-through decoration-success/60" : "text-foreground"}`}>
                    {step.title}
                    {isDone && <span className="sr-only"> (done)</span>}
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-muted">{step.detail}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
      <p className="meta mt-3">Stage {index + 1} of {START_HERE_PATH.length}</p>
    </li>
  );
}

/** Compact version for the homepage band: a progress line and the next step. */
export function StartHereMini() {
  const { completed, total, done } = useStartHereProgress();
  const next = START_HERE_TRACKED.find((s) => !done.has(`${s.progress!.kind}:${s.progress!.id}`));
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
          <div className="path-progress h-full rounded-full bg-gold-fill" style={{ width: `${total ? (completed / total) * 100 : 0}%` }} />
        </div>
        <p className="meta mt-1.5">
          {completed === 0 ? `${total} short steps, start to finish.` : `${completed} of ${total} steps done.`}
        </p>
      </div>
      <Link href={next ? next.href : "/start-here"} className="btn btn-primary shrink-0">
        {completed === 0 ? "Start here" : next ? "Continue" : "See the path"}
        <ChevronRightIcon className="size-4" />
      </Link>
    </div>
  );
}
