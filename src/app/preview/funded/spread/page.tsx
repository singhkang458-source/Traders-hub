import type { Metadata } from "next";
import FirmBrowser from "@/components/funded-preview/FirmBrowser";
import SpreadView from "@/components/funded-preview/SpreadView";
import { propFirms } from "@/lib/propfirms";

export const metadata: Metadata = { title: "Funded concept — Spread", robots: { index: false } };

export default function Page() {
  const currencies = [...new Set(propFirms.map((f) => f.currency))];
  return (
    <FirmBrowser firms={propFirms}>
      <SpreadView currencies={currencies} />
    </FirmBrowser>
  );
}
