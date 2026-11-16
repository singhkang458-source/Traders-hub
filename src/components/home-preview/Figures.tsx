import Link from "next/link";
import FirmBadge from "@/components/FirmBadge";
import MiniBarCompare from "@/components/explore/MiniBarCompare";
import MiniDotPlot from "@/components/explore/MiniDotPlot";
import MiniPulseFeed from "@/components/explore/MiniPulseFeed";
import MiniIconCluster from "@/components/explore/MiniIconCluster";
import MiniCandlePreview from "@/components/explore/MiniCandlePreview";
import MiniCurriculumPath from "@/components/explore/MiniCurriculumPath";
import {
  BookIcon,
  BoltIcon,
  GridIcon,
  LinkIcon,
  MonitorIcon,
  RevertIcon,
  VolumeBarsIcon,
  WaveStructureIcon,
} from "@/components/icons";
import { TOOL_CATEGORY_LABELS, TOOL_CATEGORY_ORDER } from "@/lib/tool-types";
import type { HomePreview, HomeSectionPreview, PreviewSnapshot } from "@/lib/home-preview";

const TOOL_ICONS = {
  charting: WaveStructureIcon,
  indicators: VolumeBarsIcon,
  backtesting: RevertIcon,
  journals: BookIcon,
  automation: BoltIcon,
  vps: MonitorIcon,
  "market-data": GridIcon,
  copiers: LinkIcon,
} as const;

function Snapshots({ items }: { items: PreviewSnapshot[] }) {
  return (
    <ul className="hx-snaps">
      {items.map((item) => {
        const inner = (
          <>
            <FirmBadge name={item.name} logo={item.logo} logoBg={item.logoBg} />
            <span className="hx-snap-name">{item.name}</span>
            {(item.primary || item.secondary) && (
              <span className="hx-snap-facts">
                {item.primary && <span className="hx-snap-primary">{item.primary}</span>}
                {item.secondary && <span className="hx-snap-secondary">{item.secondary}</span>}
              </span>
            )}
          </>
        );
        return (
          <li key={item.name}>
            {item.href ? (
              <Link href={item.href} className="hx-snap">
                {inner}
              </Link>
            ) : (
              <div className="hx-snap">{inner}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function SectionFigure({ section, home }: { section: HomeSectionPreview; home: HomePreview }) {
  if (section.slug === "learn") {
    return (
      <div className="hx-figure">
        <ul className="hx-snaps">
          {section.learn.map((topic) => (
            <li key={topic.href}>
              <Link href={topic.href} className="hx-snap">
                <span className="hx-snap-index" aria-hidden="true">
                  {String(topic.index).padStart(2, "0")}
                </span>
                <span className="hx-snap-name">{topic.shortTitle}</span>
                <span className="hx-snap-secondary">{topic.minutes} min</span>
              </Link>
            </li>
          ))}
        </ul>
        <MiniCurriculumPath topics={home.learnTopics} />
      </div>
    );
  }
  if (section.slug === "funded-accounts") {
    return (
      <div className="hx-figure">
        <Snapshots items={section.snapshots} />
        <MiniBarCompare items={home.fundedBars} label="Profit split, by firm" />
      </div>
    );
  }
  if (section.slug === "courses") {
    return (
      <div className="hx-figure">
        <Snapshots items={section.snapshots} />
        <MiniDotPlot items={home.courseDots} />
      </div>
    );
  }
  if (section.slug === "signal-groups") {
    return (
      <div className="hx-figure">
        <Snapshots items={section.snapshots} />
        <MiniPulseFeed items={home.signalFeed} />
      </div>
    );
  }
  if (section.slug === "brokers") {
    return (
      <div className="hx-figure">
        <Snapshots items={section.snapshots} />
        <MiniBarCompare items={home.brokerBars} label="Minimum deposit, by broker" />
      </div>
    );
  }
  if (section.slug === "tools") {
    const items = TOOL_CATEGORY_ORDER.slice(0, 8).map((cat) => ({
      label: TOOL_CATEGORY_LABELS[cat],
      icon: TOOL_ICONS[cat] ?? MonitorIcon,
    }));
    return (
      <div className="hx-figure">
        <Snapshots items={section.snapshots} />
        <MiniIconCluster items={items} />
      </div>
    );
  }
  return (
    <div className="hx-figure">
      <ul className="hx-snaps">
        {section.strategies.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="hx-snap">
              <span className="hx-snap-name">
                {item.name}
                <span className="hx-snap-secondary">{item.category}</span>
              </span>
              <span className="hx-pill">{item.tier}</span>
            </Link>
          </li>
        ))}
      </ul>
      <MiniCandlePreview />
    </div>
  );
}
