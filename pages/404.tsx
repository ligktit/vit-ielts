import Head from "next/head";
import Link from "next/link";
import { ROUTES } from "@/shared/routes";

export default function Page404() {
  return (
    <>
      <Head>
        <title>404 – Page not found | VIT IELTS</title>
      </Head>
      <div className="min-h-screen bg-surface-app flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-8 text-center">
          <p className="font-display font-bold text-error-hero text-brand-hover leading-none tracking-[-4.8px]">
            404
          </p>

          <div className="flex flex-col gap-3">
            <h1 className="font-display font-bold text-[30px] leading-[1.08] tracking-[-0.6px] text-ink-900 whitespace-nowrap">
              This page took an early exit.
            </h1>
            <p className="font-body text-body-m text-ink-muted leading-relaxed max-w-[440px]">
              The page you&rsquo;re looking for doesn&rsquo;t exist or has
              moved. Let&rsquo;s get you back on track.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href={ROUTES.ACCOUNT.DASHBOARD}
              className="bg-ink-900 text-surface-card font-body font-bold text-[15px] px-[26px] py-[15px] rounded-full whitespace-nowrap"
            >
              Back to dashboard
            </Link>
            <Link
              href={ROUTES.PRACTICE.ARCHIVE_LISTENING}
              className="bg-surface-card border border-ink-900/10 text-ink-900 font-body font-bold text-[15px] px-[26px] py-[15px] rounded-full whitespace-nowrap"
            >
              Browse tests
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
