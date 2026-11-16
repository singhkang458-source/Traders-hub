import type { Metadata } from "next";
import TapeHome from "@/components/home-preview/TapeHome";

export const metadata: Metadata = {
  title: "Homepage concept — Tape",
  robots: { index: false },
};

export default function TapePreviewPage() {
  return <TapeHome />;
}
