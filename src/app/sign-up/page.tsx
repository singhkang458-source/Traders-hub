import type { Metadata } from "next";
import AuthPanel from "@/components/auth/AuthPanel";
import { SITE_NAME } from "@/lib/sections";

export const metadata: Metadata = {
  title: "Create an account",
  description: `Create a free ${SITE_NAME} account with Google, an email link or a password to keep your saved listings, comparisons and learning progress across devices.`,
  robots: { index: false },
};

// For new people. Returning visitors use /sign-in; the two pages link to
// each other and carry ?next= across.
export default function SignUpPage() {
  return (
    <div className="gate-page is-wide">
      <header className="gate-mast">
        <p className="eyebrow">Account</p>
        <h1 className="gate-title">Create your {SITE_NAME} account</h1>
        <p className="gate-lede">Free. Your saved listings, your learning progress and what you&apos;re using — in one place, on any device.</p>
      </header>
      <AuthPanel intent="sign-up" />
    </div>
  );
}
