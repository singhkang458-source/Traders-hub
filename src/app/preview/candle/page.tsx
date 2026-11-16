import type { Metadata } from "next";
import CandleHome from "@/components/home-preview/CandleHome";

export const metadata: Metadata = {
  title: "Homepage concept — Candle",
  robots: { index: false },
};

export default function CandlePreviewPage() {
  return <CandleHome />;
}
