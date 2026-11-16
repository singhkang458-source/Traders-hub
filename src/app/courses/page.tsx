import type { Metadata } from "next";
import Link from "next/link";
import CourseDirectory from "@/components/CourseDirectory";
import { courses } from "@/lib/courses";
import { providers } from "@/lib/providers";
import { parsePrice } from "@/lib/course-filters";
import { getSection } from "@/lib/sections";

const section = getSection("courses");

export const metadata: Metadata = {
  title: section.title,
  description: section.summary,
};

export default function CoursesPage() {
  const freeTierCount = courses.filter((c) => c.pricing.some((p) => parsePrice(p.price) === 0)).length;
  const ratedCount = courses.filter((c) => c.trustpilot || c.whop).length;
  const listed = courses.length + providers.length;

  return (
    <>
      <header className="prospectus-open">
        <p className="eyebrow">{section.title}</p>
        <h1 className="page-title mt-2 max-w-3xl">
          Find a course that <span className="prospectus-emphasis">actually fits</span> how you trade
        </h1>
        <p className="prospectus-lede">
          What each course covers, how it&apos;s delivered and what it costs — plus independent
          Trustpilot ratings, not just the provider&apos;s own claims. We don&apos;t verify
          trading performance or results.
        </p>
        <dl className="prospectus-census">
          <div>
            <dt>Courses &amp; providers</dt>
            <dd>{listed}</dd>
          </div>
          <div>
            <dt>With a free tier</dt>
            <dd>{freeTierCount}</dd>
          </div>
          <div>
            <dt>Independently rated</dt>
            <dd>{ratedCount}</dd>
          </div>
          <div>
            <dt>Performance scores shown</dt>
            <dd>0</dd>
          </div>
        </dl>
        <p className="prospectus-footnote">
          Ratings come from Trustpilot or Whop, sourced and linked on every course page — never our own score.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a href="#browse" className="btn btn-primary">
            Browse all courses
          </a>
          <Link href="/strategies" className="btn btn-outline">
            Prefer to learn for free? Try a strategy
          </Link>
        </div>
      </header>

      <div id="browse" className="mt-12 scroll-mt-20">
        <CourseDirectory courses={courses} providers={providers} />
      </div>
    </>
  );
}
