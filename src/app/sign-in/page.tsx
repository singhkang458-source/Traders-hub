import type { Metadata } from "next";
import AuthPanel from "@/components/auth/AuthPanel";
import { SITE_NAME } from "@/lib/sections";

export const metadata: Metadata = {
  title: "Sign in",
  description: `Sign in to ${SITE_NAME} with Google, an email link or a password.`,
  robots: { index: false },
};

// For people coming back: just the heading and the card, so the three ways
// in sit above the fold. New people are sent to /sign-up, which explains
// what an account is for.
export default function SignInPage() {
  return (
    <div className="gate-page is-narrow">
      <header className="gate-mast">
        <p className="eyebrow">Account</p>
        <h1 className="gate-title">Sign in to {SITE_NAME}</h1>
      </header>
      <AuthPanel intent="sign-in" />
    </div>
  );
}
