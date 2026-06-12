import type { SubmissionStatus } from "~services/types/classroom";

/** Vietnamese label + antd Tag color for each derived submission status. */
export const STATUS_META: Record<
  SubmissionStatus,
  { label: string; color: string }
> = {
  submitted: { label: "Submitted", color: "green" },
  late: { label: "Late", color: "orange" },
  overdue: { label: "Overdue", color: "red" },
  pending: { label: "Not submitted", color: "default" },
};
