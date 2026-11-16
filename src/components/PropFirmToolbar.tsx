import Link from "next/link";
import EdgeFade from "@/components/EdgeFade";

// The row of beginner tools under the Funded Accounts heading — one place
// that links to everything built around the prop-firm data, so the
// directory itself stays a directory.
const TOOLS: { href: string; label: string; hint: string }[] = [
  { href: "/funded-accounts/find-my-firm", label: "Find my firm", hint: "5 quick questions" },
  { href: "/funded-accounts/compare", label: "Compare plans", hint: "Up to 3 side by side" },
  { href: "/deals", label: "Deals & codes", hint: "Every active promo" },
  { href: "/funded-accounts/cost-calculator", label: "Cost calculator", hint: "What a challenge really costs" },
  { href: "/funded-accounts/drawdown-explained", label: "Drawdown explained", hint: "Static vs trailing, live" },
];

export default function PropFirmToolbar({ current }: { current?: string }) {
  return (
    <nav aria-label="Prop firm tools" className="challenge-index">
      <EdgeFade activeSelector='[aria-current="page"]'>
        <div className="challenge-index-row">
          {TOOLS.map(({ href, label, hint }) => {
            const active = current === href;
            return (
              <Link key={href} href={href} aria-current={active ? "page" : undefined}>
                <span className="challenge-index-label">{label}</span>
                <span className="challenge-index-hint">{hint}</span>
              </Link>
            );
          })}
        </div>
      </EdgeFade>
    </nav>
  );
}
