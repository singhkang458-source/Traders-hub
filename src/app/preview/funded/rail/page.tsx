import type { Metadata } from "next";
import FirmBrowser from "@/components/funded-preview/FirmBrowser";
import RailView from "@/components/funded-preview/RailView";
import { propFirms } from "@/lib/propfirms";

export const metadata: Metadata = { title: "Funded concept — Rail", robots: { index: false } };

export default function Page() {
  const currencies = [...new Set(propFirms.map((f) => f.currency))];
  return (
    <FirmBrowser firms={propFirms}>
      <RailView currencies={currencies} />
    </FirmBrowser>
  );
}
