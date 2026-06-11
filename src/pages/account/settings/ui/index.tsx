/**
 * PageSettings — Account settings page.
 *
 * Persisted controls (saved to users.settings via browser Supabase client):
 *   - Notifications: weeklyReport, studyReminders, newMockTests,
 *     communityReplies, productUpdates
 *   - Preferences: language, timezone, appearance
 *
 * VISUAL-ONLY (not wired — needs dedicated backend work):
 *   - Two-factor authentication → requires Supabase MFA flow
 *   - Active sessions "Manage" → requires device-management implementation
 *
 * NOTE: Storing the preference is the full scope of this step.
 *   Applying `appearance` (theming), `language` (i18n), and `timezone`
 *   (date/time formatting), as well as actually sending notifications,
 *   are all future work.
 *
 * Wired links:
 *   - "Manage plan"  → ROUTES.SUBSCRIPTION
 *   - "Update" (payment method) → ROUTES.SUBSCRIPTION
 *   - "View" (invoices) → ROUTES.ACCOUNT.ORDER_HISTORY
 *   - "Change" (password) → ROUTES.ACCOUNT.MY_PROFILE
 */

import Head from "next/head";
import { useCallback, useRef, useState } from "react";
import { AppShell } from "@/widgets/layouts";
import { ROUTES } from "@/shared/routes";
import { useAppContext, useAuth } from "@/appx/providers";
import { createClient } from "~supabase/client";
import type { UserSettings } from "~services/types/database";
import Link from "next/link";

// ── Reusable primitives ──────────────────────────────────────────────────────

interface ToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
}

/** Toggle switch using brand token colors. */
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

/** Small inline "Saved" indicator that fades out. */
const SavedIndicator = ({ visible }: { visible: boolean }) => (
  <span
    aria-live="polite"
    className={[
      "text-body-s text-ink-muted transition-opacity duration-500",
      visible ? "opacity-100" : "opacity-0",
    ].join(" ")}
  >
    Saved
  </span>
);

// ── Page component ───────────────────────────────────────────────────────────

interface PageSettingsProps {
  initialSettings?: UserSettings;
}

export const PageSettings = ({ initialSettings = {} }: PageSettingsProps) => {
  const {
    masterData: {
      allSettings: { generalSettingsTitle },
    },
  } = useAppContext();
  const { currentUser } = useAuth();

  // ── Derive seeded defaults ──
  const notifs = initialSettings.notifications ?? {};

  // ── Notifications toggles (persisted) ──
  const [weeklyReport, setWeeklyReport] = useState(notifs.weeklyReport ?? true);
  const [studyReminders, setStudyReminders] = useState(
    notifs.studyReminders ?? true,
  );
  const [newMockTests, setNewMockTests] = useState(notifs.newMockTests ?? false);
  const [communityReplies, setCommunityReplies] = useState(
    notifs.communityReplies ?? true,
  );
  const [productUpdates, setProductUpdates] = useState(
    notifs.productUpdates ?? false,
  );

  // VISUAL-ONLY: Two-factor authentication — needs Supabase MFA flow
  const [twoFactor, setTwoFactor] = useState(false);

  // ── Preferences selectors (persisted — UI is ValuePill for now) ──
  const [language] = useState(initialSettings.language ?? "English");
  const [timezone] = useState(initialSettings.timezone ?? "GMT+7 · Hanoi");
  const [appearance] = useState<UserSettings["appearance"]>(
    initialSettings.appearance ?? "light",
  );

  // ── Saved indicator ──
  const [saved, setSaved] = useState(false);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showSaved = useCallback(() => {
    setSaved(true);
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    savedTimerRef.current = setTimeout(() => setSaved(false), 2000);
  }, []);

  // ── Persist helper ──
  const persist = useCallback(
    async (patch: Partial<UserSettings>) => {
      if (!currentUser?.id) return;
      const supabase = createClient();

      // Read current DB value first to avoid overwriting unrelated keys.
      // We merge at the top level; notifications sub-keys are also merged.
      const { data: row } = await supabase
        .from("users")
        .select("settings")
        .eq("id", currentUser.id)
        .single();

      const current: UserSettings = (row?.settings as UserSettings) ?? {};

      const next: UserSettings = {
        ...current,
        ...patch,
        // Deep-merge notifications sub-object when present in patch
        ...(patch.notifications
          ? {
              notifications: {
                ...current.notifications,
                ...patch.notifications,
              },
            }
          : {}),
      };

      await supabase
        .from("users")
        .update({ settings: next })
        .eq("id", currentUser.id);

      showSaved();
    },
    [currentUser?.id, showSaved],
  );

  // ── Toggle handlers that update local state then persist ──
  const handleWeeklyReport = useCallback(
    (v: boolean) => {
      setWeeklyReport(v);
      persist({ notifications: { weeklyReport: v } });
    },
    [persist],
  );
  const handleStudyReminders = useCallback(
    (v: boolean) => {
      setStudyReminders(v);
      persist({ notifications: { studyReminders: v } });
    },
    [persist],
  );
  const handleNewMockTests = useCallback(
    (v: boolean) => {
      setNewMockTests(v);
      persist({ notifications: { newMockTests: v } });
    },
    [persist],
  );
  const handleCommunityReplies = useCallback(
    (v: boolean) => {
      setCommunityReplies(v);
      persist({ notifications: { communityReplies: v } });
    },
    [persist],
  );
  const handleProductUpdates = useCallback(
    (v: boolean) => {
      setProductUpdates(v);
      persist({ notifications: { productUpdates: v } });
    },
    [persist],
  );

  // Suppress unused-variable warnings for future preference wiring
  void language;
  void timezone;
  void appearance;

  return (
    <>
      <Head>
        <title>{`Settings | ${generalSettingsTitle}`}</title>
      </Head>

      {/* Page heading */}
      <div className="mb-6 flex items-baseline gap-3">
        <div>
          <h1 className="text-heading-2 font-display font-bold text-ink-900 mb-1">
            Settings
          </h1>
          <p className="text-body-s text-ink-muted">
            Manage notifications, security, billing and preferences.
          </p>
        </div>
        <SavedIndicator visible={saved} />
      </div>

      <div className="flex flex-col gap-5">
        {/* ── Notifications (persisted) ── */}
        <SettingsCard title="Notifications">
          <SettingRow
            label="Weekly progress report"
            description="Receive a summary of your study activity every week."
            action={
              <Toggle
                checked={weeklyReport}
                onChange={handleWeeklyReport}
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
                onChange={handleStudyReminders}
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
                onChange={handleNewMockTests}
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
                onChange={handleCommunityReplies}
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
                onChange={handleProductUpdates}
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
          {/* VISUAL-ONLY: Two-factor authentication — requires Supabase MFA flow */}
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
          {/* VISUAL-ONLY: Active sessions — requires device-management implementation */}
          <SettingRow
            label="Active sessions"
            description="Review and revoke devices that are signed in to your account."
            action={<ActionButton>Manage</ActionButton>}
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

        {/* ── Preferences (persisted — selectors are ValuePill placeholders) ──
            NOTE: Applying language/timezone/appearance (i18n, theming,
            date formatting) is future work; this step only stores the values. */}
        <SettingsCard title="Preferences">
          <SettingRow
            label="Language"
            description="The language used across the platform."
            action={<ValuePill value={initialSettings.language ?? "English"} />}
          />
          <SettingRow
            label="Time zone"
            description="Used for scheduling reminders and reports."
            action={
              <ValuePill
                value={initialSettings.timezone ?? "GMT+7 · Hanoi"}
              />
            }
          />
          <SettingRow
            label="Appearance"
            description="Choose your preferred colour scheme."
            action={
              <ValuePill
                value={
                  initialSettings.appearance === "dark" ? "Dark" : "Light"
                }
              />
            }
          />
        </SettingsCard>
      </div>
    </>
  );
};

PageSettings.Layout = AppShell;
