"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { KeyRound, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import PasswordForm from "@/components/auth/PasswordForm";
import { loadCatalog, getCachedCatalog } from "@/lib/catalog-client";
import { CATALOG_KIND_LABELS, CATALOG_KIND_ORDER, type CatalogItem, type CatalogKind } from "@/lib/catalog-types";
import {
  COMPARISON_PATHS,
  alertsStore,
  comparisonsStore,
  recentsStore,
  savedStore,
  setAlertPref,
  stackStore,
  toggleComparison,
  toggleSaved,
  toggleStack,
  type SavedKind,
  type StackKind,
} from "@/lib/local-store";
import { useProgress } from "@/lib/progress-store";
import { LEARN_TOPICS } from "@/lib/learn-topics";
import { CheckIcon, ChevronRightIcon } from "@/components/icons";

// My Hub: a person's own dashboard — who they're signed in as, where they
// are in the Learn course, which strategies they're learning, what they use
// (firms, brokers, courses, tools they ticked themselves), and everything
// they've saved or looked at. Works with no account (browser data) and shows
// the same data synced when signed in. Names and links come from the static
// catalogue so the page itself carries no listing data.

const STACK_GROUPS: { kind: StackKind; title: string; empty: string; browse: string }[] = [
  { kind: "firm", title: "Funded accounts", empty: "Nothing ticked here", browse: "/funded-accounts" },
  { kind: "broker", title: "Brokers", empty: "Nothing ticked here", browse: "/brokers" },
  { kind: "course", title: "Courses", empty: "Nothing ticked here", browse: "/courses" },
  { kind: "tool", title: "Tools", empty: "Nothing ticked here", browse: "/tools" },
];

export default function MyHub({ quizCount, firmNames }: { quizCount: number; firmNames: Record<string, string> }) {
  const { status, user, supabase, signOut } = useAuth();
  const saved = savedStore.use();
  const recents = recentsStore.use();
  const comparisons = comparisonsStore.use();
  const alerts = alertsStore.use();
  const stack = stackStore.use();
  const progress = useProgress();
  const [catalog, setCatalog] = useState<CatalogItem[] | null>(getCachedCatalog());
  const [catalogFailed, setCatalogFailed] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!getCachedCatalog()) loadCatalog().then(setCatalog, () => setCatalogFailed(true));
  }, []);

  const lookup = useMemo(() => new Map((catalog ?? []).map((c) => [`${c.kind}:${c.id}`, c])), [catalog]);
  const resolve = (kind: string, id: string) => lookup.get(`${kind}:${id}`) ?? null;
  const loading = !catalog && !catalogFailed;

  const savedByKind = CATALOG_KIND_ORDER.map((kind) => ({ kind, items: saved.filter((s) => s.kind === kind) })).filter(
    (g) => g.items.length > 0,
  );

  const learnDoneSet = new Set(progress.filter((p) => p.kind === "learn").map((p) => p.id));
  const learnDone = LEARN_TOPICS.filter((t) => learnDoneSet.has(t.slug)).length;
  const nextTopicIndex = LEARN_TOPICS.findIndex((t) => !learnDoneSet.has(t.slug));
  const quizDoneSet = new Set(progress.filter((p) => p.kind === "quiz").map((p) => p.id));

  // "Strategies you're learning": any strategy whose quiz is done or that was
  // opened recently, newest first.
  const strategyIds = useMemo(() => {
    const ids: string[] = [];
    for (const r of recents) if (r.kind === "strategy" && !ids.includes(r.id)) ids.push(r.id);
    for (const p of progress) if (p.kind === "quiz" && !ids.includes(p.id)) ids.push(p.id);
    return ids;
  }, [recents, progress]);

  const optedIn = alerts.filter((a) => a.optedIn);

  async function deleteAccount() {
    if (!supabase) return;
    setDeleting(true);
    setDeleteError(null);
    const { error } = await supabase.rpc("delete_my_account");
    if (error) {
      setDeleteError("We couldn't delete the account just now. Try again, or email us (see the privacy policy).");
      setDeleting(false);
      return;
    }
    await signOut();
    setDeleting(false);
    setConfirmDelete(false);
  }

  const signedIn = status === "signed-in" && user;

  return (
    <div className="locker">
      <section aria-label="Your account" className="locker-plate">
        <div className="locker-who">
          <span aria-hidden="true" className="locker-mark">
            {signedIn ? (user.email ?? "?").charAt(0).toUpperCase() : "?"}
          </span>
          <div className="min-w-0 flex-1">
            {status === "loading" ? (
              <div className="skeleton h-12 w-64 rounded-lg" />
            ) : signedIn ? (
              <>
                <p className="readout">Signed in</p>
                <p className="truncate text-xl font-semibold text-foreground sm:text-2xl" title={user.email ?? undefined}>
                  {user.email}
                </p>
                <p className="meta mt-0.5">
                  {user.provider === "google" ? "Google account" : "Email account"}
                  {user.hasPassword && " · password set"}
                  {user.createdAt && ` · member since ${new Date(user.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}`}
                </p>
              </>
            ) : (
              <>
                <p className="readout">{status === "disabled" ? "Accounts off" : "Not signed in"}</p>
                <p className="text-xl font-semibold text-foreground">Browsing without an account</p>
                <p className="meta mt-0.5">
                  {status === "disabled"
                    ? "Everything here is stored in this browser only."
                    : "Everything here lives in this browser. Create a free account, or sign in, to keep it on any device."}
                </p>
              </>
            )}
          </div>
          {signedIn ? (
            <button type="button" onClick={() => signOut()} className="btn btn-outline w-full sm:w-auto">
              <LogOut className="size-4" aria-hidden="true" />
              Sign out
            </button>
          ) : (
            status === "signed-out" && (
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <Link href="/sign-up" className="btn btn-primary w-full sm:w-auto">
                  Create account
                </Link>
                <Link href="/sign-in" className="btn btn-outline w-full sm:w-auto">
                  Sign in
                </Link>
              </div>
            )
          )}
        </div>

        <dl className="locker-counts">
          <Stat label="Learn" value={`${learnDone} / ${LEARN_TOPICS.length}`} />
          <Stat label="Quizzes done" value={`${quizDoneSet.size} / ${quizCount}`} />
          <Stat label="Saved" value={String(saved.length)} />
          <Stat label="Using" value={String(stack.length)} />
        </dl>
      </section>

      <div className="locker-wall">
        <div className="locker-main">
          <Section title="Learn to trade — the 9 parts" count={`${learnDone}/${LEARN_TOPICS.length}`}>
            <ol className="pigeon-slots">
              {LEARN_TOPICS.map((t, i) => {
                const done = learnDoneSet.has(t.slug);
                const isNext = i === nextTopicIndex;
                return (
                  <li key={t.slug}>
                    <Link
                      href={`/learn/${t.slug}`}
                      className={`pigeon-slot ${done ? "is-done" : ""} ${isNext ? "is-next" : ""}`}
                      aria-label={`Part ${i + 1}: ${t.title}${done ? " (done)" : isNext ? " (up next)" : ""}`}
                    >
                      <span className={`pigeon-slot-num ${done ? "is-done" : ""}`} aria-hidden="true">
                        {done ? <CheckIcon className="size-3.5" /> : i + 1}
                      </span>
                      <span className="pigeon-slot-name">{t.shortTitle}</span>
                    </Link>
                  </li>
                );
              })}
            </ol>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {nextTopicIndex >= 0 ? (
                <Link href={`/learn/${LEARN_TOPICS[nextTopicIndex].slug}`} className="btn btn-primary">
                  {learnDone === 0 ? "Start with part 1" : `Continue with part ${nextTopicIndex + 1}`}
                  <ChevronRightIcon className="size-4" />
                </Link>
              ) : (
                <p className="badge badge-success">All 9 parts done</p>
              )}
              <span className="meta">
                {nextTopicIndex >= 0 ? `Up next: ${LEARN_TOPICS[nextTopicIndex].title} · ${LEARN_TOPICS[nextTopicIndex].readMinutes} min` : "Revisit any part from the list above."}
              </span>
            </div>
          </Section>

          <Section title="Strategies you're learning" count={strategyIds.length || undefined}>
            {strategyIds.length === 0 ? (
              <Empty text="Open any strategy to start — each has a live chart and a short quiz." href="/strategies" action="Browse strategies" />
            ) : (
              <ul>
                {strategyIds.slice(0, 10).map((id) => (
                  <ItemRow
                    key={id}
                    item={resolve("strategy", id)}
                    fallback={{ kind: "strategy", id }}
                    loading={loading}
                    action={
                      quizDoneSet.has(id) ? (
                        <span className="badge badge-success inline-flex items-center gap-1 whitespace-nowrap">
                          <CheckIcon className="size-3" />
                          Quiz done
                        </span>
                      ) : (
                        <span className="meta whitespace-nowrap">In progress</span>
                      )
                    }
                  />
                ))}
              </ul>
            )}
          </Section>

          <Section title="What I'm using" count={stack.length || undefined}>
            <p className="meta mb-3">
              Firms, brokers, courses and tools you&apos;ve ticked on their pages. Only you see this — we don&apos;t check it
              or share it.
            </p>
            <div className="pigeon-grid">
              {STACK_GROUPS.map((g) => {
                const items = stack.filter((s) => s.kind === g.kind);
                return (
                  <div key={g.kind} className="pigeon-hole">
                    <p className="eyebrow">{g.title}</p>
                    {items.length === 0 ? (
                      <p className="mt-2 text-sm text-muted">
                        {g.empty}.{" "}
                        <Link href={g.browse} className="text-accent underline">
                          Browse
                        </Link>
                      </p>
                    ) : (
                      <ul className="mt-1">
                        {items.map((s) => (
                          <ItemRow
                            key={s.id}
                            compact
                            item={resolve(s.kind, s.id)}
                            fallback={{ kind: s.kind, id: s.id, title: s.kind === "firm" ? firmNames[s.id] : undefined }}
                            loading={loading}
                            action={
                              <button
                                type="button"
                                onClick={() => toggleStack(s.kind, s.id)}
                                className="inline-flex min-h-11 items-center text-xs text-muted underline hover:text-foreground"
                              >
                                Remove
                              </button>
                            }
                          />
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </Section>

          <Section title="Saved listings" count={saved.length || undefined}>
            {saved.length === 0 ? (
              <Empty text="Tap the bookmark on any firm, course, broker, tool, signal group or strategy to save it here." href="/funded-accounts" action="Browse prop firms" />
            ) : (
              <>
                {catalogFailed && <p className="meta mb-2">Couldn&apos;t load listing names — links still work.</p>}
                <div className="space-y-4">
                  {savedByKind.map((g) => (
                    <div key={g.kind} className="pigeon-hole">
                      <p className="eyebrow">{CATALOG_KIND_LABELS[g.kind]}</p>
                      <ul className="mt-1">
                        {g.items.map((s) => (
                          <ItemRow
                            key={`${s.kind}:${s.id}`}
                            item={resolve(s.kind, s.id)}
                            fallback={{ kind: s.kind, id: s.id }}
                            loading={loading}
                            action={
                              <button
                                type="button"
                                onClick={() => toggleSaved(s.kind as SavedKind, s.id)}
                                className="inline-flex min-h-11 items-center text-xs text-muted underline hover:text-foreground"
                              >
                                Remove
                              </button>
                            }
                          />
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Section>

          {comparisons.length > 0 && (
            <Section title="Saved comparisons" count={comparisons.length}>
              <ul>
                {comparisons.map((c) => (
                  <li key={`${c.kind}:${c.query}`} className="pigeon-slip">
                    <Link href={`${COMPARISON_PATHS[c.kind]}${c.query}`} className="min-w-0 flex-1 hover:text-accent">
                      <span className="block truncate font-semibold">{c.title || "Comparison"}</span>
                      <span className="meta block capitalize">{c.kind}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleComparison(c.kind, c.query, c.title)}
                      className="inline-flex min-h-11 items-center text-xs text-muted underline hover:text-foreground"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {optedIn.length > 0 && (
            <Section title="Price & promo alerts" count={optedIn.length}>
              <p className="meta mb-3">
                Firms you&apos;ve asked to hear about. No emails go out yet — this is the consented list for when alerts
                launch.
              </p>
              <ul>
                {optedIn.map((a) => (
                  <ItemRow
                    key={a.firmId}
                    item={resolve("firm", a.firmId)}
                    fallback={{ kind: "firm", id: a.firmId, title: firmNames[a.firmId] }}
                    loading={loading}
                    action={
                      <button
                        type="button"
                        onClick={() => setAlertPref(a.firmId, false)}
                        className="inline-flex min-h-11 items-center text-xs text-muted underline hover:text-foreground"
                      >
                        Turn off
                      </button>
                    }
                  />
                ))}
              </ul>
            </Section>
          )}

          {recents.length > 0 && (
            <Section title="Recently viewed" count={recents.length}>
              <ul>
                {recents.slice(0, 12).map((r) => (
                  <ItemRow
                    key={`${r.kind}:${r.id}`}
                    item={resolve(r.kind, r.id)}
                    fallback={{ kind: r.kind, id: r.id }}
                    loading={loading}
                    action={<span className="meta whitespace-nowrap">{relativeTime(r.viewedAt)}</span>}
                  />
                ))}
              </ul>
              <button type="button" onClick={() => recentsStore.set([])} className="mt-3 inline-flex min-h-11 items-center text-xs text-muted underline hover:text-foreground">
                Clear history
              </button>
            </Section>
          )}
        </div>

        <aside className="locker-side">
          {signedIn && (
            <section className="pigeon">
              <h2 className="pigeon-label">
                <span className="inline-flex items-center gap-2">
                  <KeyRound className="size-3.5" aria-hidden="true" />
                  Password
                </span>
              </h2>
              <div className="pigeon-body">
                {user.hasPassword && !changingPassword ? (
                  <>
                    <p className="meta">Set. You can sign in with your email and password, Google or an email link.</p>
                    <button type="button" onClick={() => setChangingPassword(true)} className="btn btn-outline mt-3 w-full">
                      Change password
                    </button>
                  </>
                ) : (
                  <>
                    <p className="meta mb-3">
                      {user.hasPassword
                        ? "Choose a new password."
                        : "Optional. Add one to sign in without waiting for an email."}
                    </p>
                    <PasswordForm
                      submitLabel={user.hasPassword ? "Save new password" : "Add password"}
                      onDone={changingPassword ? () => setChangingPassword(false) : undefined}
                    />
                    {changingPassword && (
                      <button type="button" onClick={() => setChangingPassword(false)} className="mt-2 inline-flex min-h-11 items-center text-xs text-muted underline">
                        Cancel
                      </button>
                    )}
                  </>
                )}
              </div>
            </section>
          )}

          <section className="pigeon">
            <h2 className="pigeon-label">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="size-3.5" aria-hidden="true" />
                Your data
              </span>
            </h2>
            <div className="pigeon-body">
              {signedIn ? (
                <>
                  <p className="meta">
                    We hold your user id, email, the time you confirmed you&apos;re 18+, and what&apos;s on this page. If you set
                    a password, our account provider stores it hashed — we never see it. Deleting your account removes all of
                    it, permanently.
                  </p>
                  {!confirmDelete ? (
                    <button type="button" onClick={() => setConfirmDelete(true)} className="mt-3 inline-flex min-h-11 items-center text-xs text-danger underline">
                      Delete my account
                    </button>
                  ) : (
                    <div className="mt-3 border border-danger/40 bg-danger/10 p-3">
                      <p className="text-sm font-semibold text-foreground">Delete everything? This can&apos;t be undone.</p>
                      <p className="meta mt-1">Your browser copy of saved items stays until you clear site data.</p>
                      {deleteError && (
                        <p role="alert" className="mt-2 text-xs text-danger">
                          {deleteError}
                        </p>
                      )}
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          disabled={deleting}
                          onClick={deleteAccount}
                          className="btn min-h-10 flex-1 border-danger bg-danger text-white hover:bg-danger/90 disabled:opacity-60"
                        >
                          {deleting ? "Deleting…" : "Yes, delete"}
                        </button>
                        <button type="button" disabled={deleting} onClick={() => setConfirmDelete(false)} className="btn btn-outline min-h-10 flex-1">
                          Keep it
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="meta">Everything on this page is stored in this browser only. Clearing site data removes it.</p>
              )}
              <p className="meta mt-4">
                <Link href="/privacy" className="text-accent underline">
                  Privacy policy
                </Link>
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="locker-count">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count?: number | string;
  children: ReactNode;
}) {
  return (
    <section className="pigeon">
      <h2 className="pigeon-label">
        <span>{title}</span>
        {count != null && <span className="pigeon-count">{count}</span>}
      </h2>
      <div className="pigeon-body">{children}</div>
    </section>
  );
}

function Empty({ text, href, action }: { text: string; href: string; action: string }) {
  return (
    <div className="pigeon-empty">
      <p>{text}</p>
      <Link href={href} className="btn btn-outline">
        {action}
      </Link>
    </div>
  );
}

function ItemRow({
  item,
  fallback,
  loading,
  action,
  compact = false,
}: {
  item: CatalogItem | null;
  fallback: { kind: string; id: string; title?: string };
  loading: boolean;
  action: ReactNode;
  compact?: boolean;
}) {
  const href = item?.href ?? fallbackHref(fallback.kind, fallback.id);
  const title = item?.title ?? fallback.title ?? fallback.id;
  return (
    <li className={`pigeon-slip ${compact ? "is-compact" : ""}`}>
      {item?.logo ? (
        <span className={`pigeon-stamp ${item.logoBg === "dark" ? "is-dark" : ""}`}>
          <Image src={item.logo} alt="" width={40} height={40} className="size-full object-contain" />
        </span>
      ) : (
        <span aria-hidden="true" className="pigeon-stamp is-blank">
          {loading ? "" : title.slice(0, 2)}
        </span>
      )}
      <Link href={href} className="min-w-0 flex-1 hover:text-accent">
        {loading && !item ? (
          <span className="skeleton block h-4 w-40 rounded" />
        ) : (
          <>
            <span className="block truncate font-semibold">{title}</span>
            {item?.subtitle && !compact && <span className="meta block truncate">{item.subtitle}</span>}
          </>
        )}
      </Link>
      {action}
    </li>
  );
}

function fallbackHref(kind: string, id: string): string {
  const base: Record<string, string> = {
    firm: "/funded-accounts",
    course: "/courses",
    broker: "/brokers",
    tool: "/tools",
    signal: "/signal-groups",
    strategy: "/strategies",
    learn: "/learn",
  };
  return `${base[kind as CatalogKind] ?? ""}/${id}`;
}

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.round(ms / 60_000);
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "yesterday" : `${days} days ago`;
}
