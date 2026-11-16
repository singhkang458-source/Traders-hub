import type { Metadata } from "next";
import KineticHome from "@/components/home-preview/KineticHome";

export const metadata: Metadata = {
  title: "Homepage concept — Kinetic",
  robots: { index: false },
};

export default function KineticPreviewPage() {
  return <KineticHome />;
}
