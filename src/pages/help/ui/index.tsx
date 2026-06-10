import Head from "next/head";
import { useState } from "react";
import { AppShell } from "@/widgets/layouts";
import { useAppContext } from "@/appx/providers";

// ── Static data ─────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    id: "getting-started",
    icon: "rocket_launch",
    iconBg: "bg-brand-tint",
    iconColor: "text-brand-hover",
    title: "Getting started",
    count: 6,
  },
  {
    id: "mock-tests",
    icon: "quiz",
    iconBg: "bg-accent-blue/10",
    iconColor: "text-accent-blue",
    title: "Mock tests",
    count: 12,
  },
  {
    id: "billing",
    icon: "credit_card",
    iconBg: "bg-accent-yellow/20",
    iconColor: "text-ink-700",
    title: "Billing & plans",
    count: 8,
  },
  {
    id: "account",
    icon: "manage_accounts",
    iconBg: "bg-surface-blush",
    iconColor: "text-danger",
    title: "Account & security",
    count: 7,
  },
  {
    id: "feedback",
    icon: "rate_review",
    iconBg: "bg-accent-teal/10",
    iconColor: "text-accent-teal",
    title: "Feedback & grading",
    count: 5,
  },
  {
    id: "technical",
    icon: "build",
    iconBg: "bg-accent-violet/10",
    iconColor: "text-accent-violet",
    title: "Technical issues",
    count: 9,
  },
] as const;

const POPULAR_QUESTIONS = [
  {
    id: "q1",
    question: "How do I start a mock IELTS test?",
    answer:
      "Head to the Mock Tests section in the sidebar, choose a test from the library, and press \"Start test\". Your progress is saved automatically so you can pause and resume anytime.",
  },
  {
    id: "q2",
    question: "How is my writing or speaking scored?",
    answer:
      "Submissions are reviewed using Vit IELTS's AI-assisted grading model aligned with the official IELTS band descriptors. You'll receive band estimates and detailed feedback within minutes.",
  },
  {
    id: "q3",
    question: "What's included in the Pro plan?",
    answer:
      "Pro gives you unlimited mock tests, AI writing & speaking feedback, full practice libraries, and early access to new features. See the Subscription page for the latest pricing.",
  },
  {
    id: "q4",
    question: "I can't hear the listening audio. What should I try?",
    answer:
      "Check that your browser has microphone/audio permissions and that your system volume is unmuted. Try refreshing the page or switching to Chrome/Edge for the best experience.",
  },
  {
    id: "q5",
    question: "How do I cancel or change my subscription?",
    answer:
      "Go to My Profile → Your Plan → Manage subscription. Changes take effect at the end of your current billing cycle.",
  },
] as const;

// ── Component ────────────────────────────────────────────────────────────────

export const PageHelp = () => {
  const {
    masterData: {
      allSettings: { generalSettingsTitle },
    },
  } = useAppContext();

  // Track which FAQ item is open (first one open by default)
  const [openId, setOpenId] = useState<string | null>("q1");

  const toggle = (id: string) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <>
      <Head>
        <title>{`Help & Support | ${generalSettingsTitle}`}</title>
      </Head>

      {/* ── Page heading ── */}
      <div className="mb-8">
        <h1 className="text-heading-1 font-display font-bold text-ink-900 mb-2">
          Help &amp; Support
        </h1>
        <p className="text-body-m text-ink-muted">
          Find answers fast, or reach our team.
        </p>
      </div>

      {/* ── Dark hero search card ── */}
      <div className="bg-ink-900 rounded-2xl p-8 mb-8 flex flex-col items-center text-center gap-6">
        <h2 className="text-heading-2 font-display font-bold text-surface-card">
          How can we help?
        </h2>
        <div className="flex w-full max-w-xl gap-3">
          <input
            type="text"
            readOnly
            placeholder="Search for help…"
            aria-label="Search for help"
            className="
              flex-1 px-4 py-3 rounded-xl
              bg-ink-700 text-surface-card placeholder:text-ink-muted
              border border-border-hairline/20
              text-body-m outline-none cursor-default
            "
          />
          {/* Visual-only search button — no handler wired */}
          <button
            type="button"
            aria-label="Search (visual only)"
            className="
              px-6 py-3 rounded-xl
              bg-brand text-ink-900
              font-semibold text-body-m
              hover:bg-brand-hover transition-colors duration-200
              cursor-pointer
            "
          >
            Search
          </button>
        </div>
      </div>

      {/* ── Browse by topic ── */}
      <section className="mb-8">
        <h2 className="text-heading-2 font-display font-bold text-ink-900 mb-5">
          Browse by topic
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="
                bg-surface-card rounded-2xl p-5 shadow-primary
                flex items-center gap-4
                hover:shadow-md transition-shadow duration-200
                cursor-default
              "
            >
              {/* Icon tile */}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${cat.iconBg}`}
              >
                <span
                  className={`material-symbols-rounded text-2xl! ${cat.iconColor}`}
                >
                  {cat.icon}
                </span>
              </div>
              {/* Text */}
              <div>
                <p className="text-label-bold font-bold text-ink-900">
                  {cat.title}
                </p>
                <p className="text-body-s text-ink-muted">
                  {cat.count} articles
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Popular questions ── */}
      <section className="mb-8">
        <h2 className="text-heading-2 font-display font-bold text-ink-900 mb-5">
          Popular questions
        </h2>
        <div className="bg-surface-card rounded-2xl shadow-primary overflow-hidden divide-y divide-border-hairline">
          {POPULAR_QUESTIONS.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div key={item.id}>
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  className="
                    w-full flex items-center justify-between
                    px-6 py-4 text-left
                    hover:bg-brand-tint transition-colors duration-150
                    cursor-pointer
                  "
                  aria-expanded={isOpen}
                >
                  <span className="text-body-m font-semibold text-ink-900 pr-4">
                    {item.question}
                  </span>
                  <span
                    className={`
                      material-symbols-rounded text-xl! text-ink-muted shrink-0
                      transition-transform duration-200
                      ${isOpen ? "rotate-180" : "rotate-0"}
                    `}
                  >
                    expand_more
                  </span>
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1">
                    <p className="text-body-s text-ink-700 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Still need help? CTA ── */}
      <section>
        <div className="bg-brand rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-heading-2 font-display font-bold text-ink-900 mb-1">
              Still need help?
            </h2>
            <p className="text-body-m text-ink-700">
              Our support team is happy to assist you.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {/* Live chat — visual only, no handler */}
            <button
              type="button"
              aria-label="Live chat (coming soon)"
              className="
                px-6 py-3 rounded-xl
                bg-ink-900 text-surface-card
                font-semibold text-body-m
                hover:bg-ink-700 transition-colors duration-200
                cursor-pointer
              "
            >
              Live chat
            </button>
            {/* Email us — mailto link */}
            <a
              href="mailto:support@vitielts.com"
              className="
                px-6 py-3 rounded-xl
                bg-surface-card text-ink-900
                font-semibold text-body-m
                border border-border-hairline
                hover:bg-brand-tint transition-colors duration-200
                no-underline
              "
            >
              Email us
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

PageHelp.Layout = AppShell;
