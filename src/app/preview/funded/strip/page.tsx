import type { Metadata } from "next";
import FirmBrowser from "@/components/funded-preview/FirmBrowser";
import StripView from "@/components/funded-preview/StripView";
import { propFirms } from "@/lib/propfirms";

export const metadata: Metadata = { title: "Funded concept — Strip", robots: { index: false } };

export default function Page() {
  const currencies = [...new Set(propFirms.map((f) => f.currency))];
  return (
    <FirmBrowser firms={propFirms}>
      <StripView currencies={currencies} />
    </FirmBrowser>
  );
}
