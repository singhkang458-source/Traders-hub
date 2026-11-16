"use client";

import type { ReactNode } from "react";
import { OPEN_SEARCH_EVENT } from "@/components/BottomNav";

export default function SearchTrigger({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <button
      type="button"
      className={className}
      aria-label="Search the site"
      aria-keyshortcuts="Control+K Meta+K"
      onClick={() => window.dispatchEvent(new Event(OPEN_SEARCH_EVENT))}
    >
      {children}
    </button>
  );
}
