/**
 * PageSettings — Account settings page.
 *
 * All toggles and selectors are VISUAL-ONLY (local useState; no persistence).
 * Wired links:
 *   - "Manage plan"  → ROUTES.SUBSCRIPTION
 *   - "Update" (payment method) → ROUTES.SUBSCRIPTION
 *   - "View" (invoices) → ROUTES.ACCOUNT.ORDER_HISTORY
 *   - "Change" (password) → ROUTES.ACCOUNT.MY_PROFILE
 *
 * Danger card ("Delete account") is intentionally omitted.
 */

import Head from "next/head";
import { useState } from "react";
import { AppShell } from "@/widgets/layouts";
import { ROUTES } from "@/shared/routes";
import { useAppContext } from "@/appx/providers";
import Link from "next/link";

// ── Reusable primitives ──────────────────────────────────────────────────────

interface ToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
}

/** Visual-only toggle switch using brand token colors. */
const Toggle = ({ checked, onChange, label }: ToggleProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={[
      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent",
      "transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2",
      "focus-visible:ring-brand focus-visible:ring-offset-2",
      checked ? "bg-brand" : "bg-border-hairline",
    ].join(" ")}
  >
    <span
      className={[
        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-primary",
        "transition duration-200",
        checked ? "translate-x-5" : "translate-x-0",
      ].join(" ")}
    />
  </button>
);

interface SettingRowProps {
  label: string;
  description?: string;
  action?: React.ReactNode;
}

/** A single row inside a settings card. */
const SettingRow = ({ label, description, action }: SettingRowProps) => (
  <div className="flex items-center justify-between gap-4 py-4 border-b border-border-hairline last:border-b-0">
    <div className="flex-1 min-w-0">
      <p className="text-body-m font-medium text-ink-900">{label}</p>
      {description && (
        <p className="text-body-s text-ink-muted mt-0.5">{description}</p>
      )}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

interface SettingsCardProps {
  title: string;
  children: React.ReactNode;
}

const SettingsCard = ({ title, children }: SettingsCardProps) => (
  <section className="bg-surface-card rounded-2xl px-6 pt-5 pb-1 shadow-primary">
    <h2 className="text-title-m font-display font-bold text-ink-900 mb-1">
      {title}
    </h2>
    <div>{children}</div>
  </section>
);

/** Pill showing a static preference value. */
const ValuePill = ({ value }: { value: string }) => (
  <span className="inline-flex items-center rounded-lg bg-brand-tint border border-border-hairline px-3 py-1 text-body-s font-medium text-ink-700">
    {value}
  </span>
);

/** Ghost "action" button used inside cards. */
const ActionButton = ({
  href,
  onClick,
  children,
}: {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) => {
  const cls =
    "inline-flex items-center gap-1 rounded-xl border border-border-hairline bg-surface-card px-4 py-2 text-body-s font-medium text-ink-900 hover:bg-brand-tint hover:border-brand transition-colors duration-150 cursor-pointer";
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  );
};

// ── Page component ───────────────────────────────────────────────────────────

export const PageSettings = () => {
  const {
    masterData: {
      allSettings: { generalSettingsTitle },
    },
  } = useAppContext();

  // ── Notifications toggles (visual-only, not persisted) ──
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [studyReminders, setStudyReminders] = useState(true);
  const [newMockTests, setNewMockTests] = useState(false);
  const [communityReplies, setCommunityReplies] = useState(true);
  const [productUpdates, setProductUpdates] = useState(false);

  // ── Security toggles (visual-only, not persisted) ──
  const [twoFactor, setTwoFactor] = useState(false);

  // ── Preferences selectors (visual-only, not persisted) ──
  const [language] = useState("English");
  const [timezone] = useState("GMT+7 · Hanoi");
  const [appearance] = useState("Light");

  return (
    <>
      <Head>
        <title>{`Settings | ${generalSettingsTitle}`}</title>
      </Head>

      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-heading-2 font-display font-bold text-ink-900 mb-1">
          Settings
        </h1>
        <p className="text-body-s text-ink-muted">
          Manage notifications, security, billing and preferences.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {/* ── Notifications ── */}
        <SettingsCard title="Notifications">
          <SettingRow
            label="Weekly progress report"
            description="Receive a summary of your study activity every week."
            action={
              <Toggle
                checked={weeklyReport}
                onChange={setWeeklyReport}
                label="Weekly progress report"
              />
            }
          />
          <SettingRow
            label="Study reminders"
            description="Get reminded to study when you have not logged in for a while."
            action={
              <Toggle
                checked={studyReminders}
                onChange={setStudyReminders}
                label="Study reminders"
              />
            }
          />
          <SettingRow
            label="New mock tests"
            description="Be notified when new practice tests are published."
            action={
              <Toggle
                checked={newMockTests}
                onChange={setNewMockTests}
                label="New mock tests"
              />
            }
          />
          <SettingRow
            label="Community replies"
            description="Get notified when someone replies to your posts or comments."
            action={
              <Toggle
                checked={communityReplies}
                onChange={setCommunityReplies}
                label="Community replies"
              />
            }
          />
          <SettingRow
            label="Product updates"
            description="Learn about new features and improvements to VIT IELTS."
            action={
              <Toggle
                checked={productUpdates}
                onChange={setProductUpdates}
                label="Product updates"
              />
            }
          />
        </SettingsCard>

        {/* ── Security ── */}
        <SettingsCard title="Security">
          <SettingRow
            label="Password"
            description="Last changed more than 90 days ago."
            action={
              <ActionButton href={ROUTES.ACCOUNT.MY_PROFILE}>
                Change
              </ActionButton>
            }
          />
          <SettingRow
            label="Two-factor authentication"
            description="Add an extra layer of security to your account."
            action={
              <Toggle
                checked={twoFactor}
                onChange={setTwoFactor}
                label="Two-factor authentication"
              />
            }
          />
          <SettingRow
            label="Active sessions"
            description="Review and revoke devices that are signed in to your account."
            action={
              /* Visual-only — no dedicated sessions management route yet */
              <ActionButton>Manage</ActionButton>
            }
          />
        </SettingsCard>

        {/* ── Billing ── */}
        <SettingsCard title="Billing">
          <SettingRow
            label="Current plan"
            description="View your active subscription and available features."
            action={
              <ActionButton href={ROUTES.SUBSCRIPTION}>
                Manage plan
              </ActionButton>
            }
          />
          <SettingRow
            label="Payment method"
            description="Update your saved payment details."
            action={
              <ActionButton href={ROUTES.SUBSCRIPTION}>Update</ActionButton>
            }
          />
          <SettingRow
            label="Invoices"
            description="Download or view your past invoices and receipts."
            action={
              <ActionButton href={ROUTES.ACCOUNT.ORDER_HISTORY}>
                View
              </ActionButton>
            }
          />
        </SettingsCard>

        {/* ── Preferences ── */}
        <SettingsCard title="Preferences">
          <SettingRow
            label="Language"
            description="The language used across the platform."
            action={<ValuePill value={language} />}
          />
          <SettingRow
            label="Time zone"
            description="Used for scheduling reminders and reports."
            action={<ValuePill value={timezone} />}
          />
          <SettingRow
            label="Appearance"
            description="Choose your preferred colour scheme."
            action={<ValuePill value={appearance} />}
          />
        </SettingsCard>
      </div>
    </>
  );
};

PageSettings.Layout = AppShell;
