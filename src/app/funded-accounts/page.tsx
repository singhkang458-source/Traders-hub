import type { Metadata } from "next";
import PropFirmDirectory from "@/components/PropFirmDirectory";
import PropFirmNotes from "@/components/PropFirmNotes";
import PropFirmToolbar from "@/components/PropFirmToolbar";
import { propFirms } from "@/lib/propfirms";
import { getSection } from "@/lib/sections";

const section = getSection("funded-accounts");

export const metadata: Metadata = {
  title: section.title,
  description: section.summary,
};

export default function FundedAccountsPage() {
  const currencies = [...new Set(propFirms.map((f) => f.currency))];

  return (
    <>
      <header className="challenge-mast">
        <p className="eyebrow">Prop firms</p>
        <h1 className="page-title mt-2">{section.title}</h1>
        <p className="challenge-lede">
          Compare prop firm challenges side by side: price, rules and profit split.
        </p>
      </header>

      <div className="mt-6">
        <PropFirmToolbar />
      </div>

      <div className="mt-6">
        <PropFirmNotes currencies={currencies} filterNote />
      </div>

      <div className="mt-6">
        <PropFirmDirectory firms={propFirms} />
      </div>
    </>
  );
}
