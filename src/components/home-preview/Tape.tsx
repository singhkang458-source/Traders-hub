import Link from "next/link";

export default function Tape({
  items,
  label,
}: {
  items: { href?: string; text: string }[];
  label: string;
}) {
  const row = items.map((item, i) =>
    item.href ? (
      <Link key={`${item.text}-${i}`} href={item.href}>
        {item.text}
      </Link>
    ) : (
      <span key={`${item.text}-${i}`}>{item.text}</span>
    ),
  );
  return (
    <div className="hx-tape" role="group" aria-label={label}>
      <div className="hx-tape-track">
        {row}
        <span className="hx-tape-gap" aria-hidden="true">
          /
        </span>
      </div>
      <div className="hx-tape-track" aria-hidden="true">
        {items.map((item, i) => (
          <span key={`copy-${item.text}-${i}`}>{item.text}</span>
        ))}
      </div>
    </div>
  );
}
