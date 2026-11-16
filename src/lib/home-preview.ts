import { SITE_NAME, sections } from "@/lib/sections";
import { propFirms } from "@/lib/propfirms";
import { courses } from "@/lib/courses";
import { providers } from "@/lib/providers";
import { brokers } from "@/lib/brokers";
import { tools } from "@/lib/tools";
import { toolPriceLabel, TOOL_CATEGORY_LABELS, TOOL_CATEGORY_ORDER } from "@/lib/tool-types";
import { signalGroups } from "@/lib/signal-groups";
import { strategies, strategiesInDisplayOrder } from "@/lib/strategies";
import { STRATEGY_TIER_LABELS, STRATEGY_CATEGORY_LABELS } from "@/lib/strategy-types";
import { LEARN_TOPICS } from "@/lib/learn-topics";
import { allAccounts } from "@/lib/propfirm-filters";
import { BROKER_CATEGORY_ITEM_LABELS } from "@/lib/broker-types";
import { sortBrokers } from "@/lib/broker-filters";
import { START_HERE_PATH } from "@/lib/start-here";
import type { BarItem } from "@/components/explore/MiniBarCompare";

function money(n: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function firstDollarAmount(priceText: string): number | null {
  const match = priceText.match(/\$\s?([\d,]+(?:\.\d+)?)/);
  if (!match) return null;
  return Number(match[1].replace(/,/g, ""));
}

export type PreviewSnapshot = {
  href: string | null;
  name: string;
  logo: string | null;
  logoBg: "white" | "dark";
  primary: string | null;
  secondary: string | null;
};

export type StrategySnap = { href: string; name: string; tier: string; category: string };
export type LearnSnap = { href: string; shortTitle: string; minutes: number; index: number };

const BLURBS: Record<string, string> = {
  learn:
    "A free, 9-part intro to trading from zero — markets, orders, candlesticks, risk, psychology and more, each with something to click on.",
  "funded-accounts":
    "Evaluation fees, account sizes, drawdown rules and profit splits — pulled from each firm's own pricing page, not a sales call.",
  courses: "What each course actually covers, how it's delivered, and independent Trustpilot ratings alongside the price.",
  "signal-groups":
    "Telegram groups filtered by market and style. No guaranteed-return pitches get listed — a free tier or trial is required.",
  brokers: "Retail brokers for trading your own money — regulation, minimum deposits and supported platforms, side by side.",
  tools: "Charting, scanners, automation and VPS hosting, with prices confirmed from each tool's own site wherever we could.",
  strategies: "58 strategies explained in plain English — each with a live chart you can play with and a quiz to test what stuck.",
};

export { HOW_IT_WORKS, WHY_POINTS, FAQ } from "./home-copy";

function fundedAccountsSnapshot(): PreviewSnapshot[] {
  const ids = ["ftmo", "alpha-funded", "topstep"];
  const chosen = ids.map((id) => propFirms.find((f) => f.id === id)).filter((f) => f != null);
  const firms = chosen.length >= 3 ? chosen : [...chosen, ...propFirms].slice(0, 3);
  return firms.map((firm) => {
    const accounts = allAccounts(firm);
    const cheapest = accounts
      .filter((a) => a.lowestPrice != null)
      .reduce<(typeof accounts)[number] | null>((best, a) => (best == null || a.lowestPrice! < best.lowestPrice! ? a : best), null);
    const splits = accounts.map((a) => a.profitSplit).filter((s): s is number => s != null);
    return {
      href: `/funded-accounts/${firm.id}`,
      name: firm.name,
      logo: firm.logo,
      logoBg: firm.logoBg,
      primary: cheapest ? money(cheapest.lowestPrice!, firm.currency) + (cheapest.monthly ? "/mo" : "") : null,
      secondary: splits.length > 0 ? `up to ${Math.max(...splits)}% split` : null,
    };
  });
}

function coursesSnapshot(): PreviewSnapshot[] {
  const affiliateCourses = courses.filter((c) => c.affiliateLink != null).slice(0, 3);
  const chosen = affiliateCourses.length >= 3 ? affiliateCourses : courses.slice(0, 3);
  return chosen.map((c) => ({
    href: `/courses/${c.id}`,
    name: c.name,
    logo: c.logo,
    logoBg: c.logoBg,
    primary: c.pricing[0]?.price ?? null,
    secondary: c.affiliateLink != null ? "Our choice" : null,
  }));
}

function brokersSnapshot(): PreviewSnapshot[] {
  const picked = sortBrokers(
    brokers.filter((b) => b.category === "cfd"),
    "name",
  );
  return picked.map((b) => ({
    href: `/brokers/${b.id}`,
    name: b.name,
    logo: b.logo,
    logoBg: b.logoBg,
    primary: b.minDeposit != null ? `${money(b.minDeposit, b.currency)} min deposit` : null,
    secondary: b.ourChoice ? "Our choice" : BROKER_CATEGORY_ITEM_LABELS[b.category],
  }));
}

function toolsSnapshot(): PreviewSnapshot[] {
  return tools.slice(0, 3).map((t) => ({
    href: `/tools/${t.slug}`,
    name: t.name,
    logo: t.logo,
    logoBg: "white" as const,
    primary: toolPriceLabel(t),
    secondary: null,
  }));
}

function signalGroupsSnapshot(): PreviewSnapshot[] {
  return signalGroups.slice(0, 3).map((g) => ({
    href: null,
    name: g.name,
    logo: null,
    logoBg: "white" as const,
    primary: g.priceLabel,
    secondary: g.memberCount,
  }));
}

function fundedAccountsSplitChart(): BarItem[] {
  const ids = ["ftmo", "alpha-funded", "topstep", "fundingpips"];
  const chosen = ids.map((id) => propFirms.find((f) => f.id === id)).filter((f) => f != null);
  return chosen
    .map((firm) => {
      const splits = allAccounts(firm)
        .map((a) => a.profitSplit)
        .filter((s): s is number => s != null);
      if (splits.length === 0) return null;
      const max = Math.max(...splits);
      return { name: firm.name, value: max, display: `${max}%` };
    })
    .filter((x): x is BarItem => x != null);
}

function brokersDepositChart(): BarItem[] {
  const picked = sortBrokers(
    brokers.filter((b) => b.category === "cfd" && b.minDeposit != null),
    "name",
  ).slice(0, 4);
  return picked.map((b) => ({
    name: b.name,
    value: 1 / Math.max(b.minDeposit!, 1),
    display: money(b.minDeposit!, b.currency),
  }));
}

export type HomeSectionPreview = {
  slug: string;
  title: string;
  blurb: string;
  count: number;
  cta: string;
  snapshots: PreviewSnapshot[];
  strategies: StrategySnap[];
  learn: LearnSnap[];
};

export type HomePreview = {
  siteName: string;
  total: number;
  stats: { label: string; value: number }[];
  stages: { title: string; href: string; steps: number }[];
  sections: HomeSectionPreview[];
  fundedBars: BarItem[];
  brokerBars: BarItem[];
  courseDots: { name: string; price: number; display: string }[];
  signalFeed: { name: string; priceLabel: string; memberCount: string | null }[];
  toolLabels: string[];
  learnTopics: { slug: string; shortTitle: string; readMinutes: number }[];
};

const COUNTS: Record<string, number> = {
  learn: LEARN_TOPICS.length,
  "funded-accounts": propFirms.length,
  courses: courses.length + providers.length,
  "signal-groups": signalGroups.length,
  brokers: brokers.length,
  tools: tools.length,
  strategies: strategies.length,
};

export function getHomePreview(): HomePreview {
  const live = sections.filter((s) => s.status === "live");
  const sectionsOut: HomeSectionPreview[] = live.map((s) => ({
    slug: s.slug,
    title: s.title,
    blurb: BLURBS[s.slug] ?? s.summary,
    count: COUNTS[s.slug] ?? 0,
    cta: s.slug === "learn" ? "Start learning" : `Browse ${s.title.toLowerCase()}`,
    snapshots:
      s.slug === "funded-accounts"
        ? fundedAccountsSnapshot()
        : s.slug === "courses"
          ? coursesSnapshot()
          : s.slug === "signal-groups"
            ? signalGroupsSnapshot()
            : s.slug === "brokers"
              ? brokersSnapshot()
              : s.slug === "tools"
                ? toolsSnapshot()
                : [],
    strategies:
      s.slug === "strategies"
        ? strategiesInDisplayOrder.slice(0, 3).map((item) => ({
            href: `/strategies/${item.slug}`,
            name: item.name,
            tier: STRATEGY_TIER_LABELS[item.tier],
            category: STRATEGY_CATEGORY_LABELS[item.category],
          }))
        : [],
    learn:
      s.slug === "learn"
        ? LEARN_TOPICS.slice(0, 3).map((topic, i) => ({
            href: `/learn/${topic.slug}`,
            shortTitle: topic.shortTitle,
            minutes: topic.readMinutes,
            index: i + 1,
          }))
        : [],
  }));

  return {
    siteName: SITE_NAME,
    total:
      propFirms.length +
      courses.length +
      providers.length +
      brokers.length +
      tools.length +
      strategies.length +
      signalGroups.length,
    stats: [
      { label: "Prop firms", value: propFirms.length },
      { label: "Courses", value: courses.length + providers.length },
      { label: "Strategies", value: strategies.length },
      { label: "Signal groups", value: signalGroups.length },
    ],
    stages: START_HERE_PATH.map((stage) => ({
      title: stage.title,
      href: stage.href,
      steps: stage.steps.length,
    })),
    sections: sectionsOut,
    fundedBars: fundedAccountsSplitChart(),
    brokerBars: brokersDepositChart(),
    courseDots: courses
      .map((c) => {
        const priceText = c.pricing[0]?.price;
        if (!priceText) return null;
        const amount = firstDollarAmount(priceText);
        if (amount == null) return null;
        return { name: c.name, price: amount, display: `$${amount}` };
      })
      .filter((x): x is { name: string; price: number; display: string } => x != null)
      .slice(0, 8),
    signalFeed: signalGroups.slice(0, 3).map((g) => ({
      name: g.name,
      priceLabel: g.priceLabel,
      memberCount: g.memberCount,
    })),
    toolLabels: TOOL_CATEGORY_ORDER.slice(0, 8).map((cat) => TOOL_CATEGORY_LABELS[cat]),
    learnTopics: LEARN_TOPICS.map((t) => ({ slug: t.slug, shortTitle: t.shortTitle, readMinutes: t.readMinutes })),
  };
}
