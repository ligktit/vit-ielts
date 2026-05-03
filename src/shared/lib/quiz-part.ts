export type IELTSSkill = "reading" | "listening" | "writing" | "speaking";

/**
 * Standardize the term used for a test section based on IELTS nomenclature:
 * - Reading: Passage
 * - Writing: Task
 * - Listening / Speaking: Part
 */
export const getSectionPrefix = (skill: IELTSSkill | string): string => {
  const normSkill = skill.toLowerCase();
  if (normSkill === "reading") return "Passage";
  if (normSkill === "writing") return "Task";
  return "Part";
};

/**
 * Parses raw part inputs from CMS (e.g. "0", "1", "passage1", "task-2") 
 * and returns the normalized label (e.g. "Passage 1", "Task 2") 
 * and an integer index (1-4) for consistent UI coloring.
 */
export const normalizeSectionBadge = (
  skill: IELTSSkill | string,
  rawPart: string | number | undefined | null
): { label: string; colorIndex: 1 | 2 | 3 | 4 | 5 } => {
  const prefix = getSectionPrefix(skill);
  
  if (rawPart === null || rawPart === undefined) {
    return { label: `${prefix} 1`, colorIndex: 1 };
  }

  const partStr = String(rawPart).toLowerCase().trim();

  // Extract number from string (e.g. "passage1" -> 1, "task-2" -> 2).
  // The new admin form (QuizEditorForm) saves 1-indexed values directly,
  // so a stored "3" already means Passage 3 — do NOT shift by +1. The old
  // 0-indexed shift (for legacy WordPress data) caused "Passage 3" in
  // admin to render as "Passage 4" on the listing card.
  const numMatch = partStr.match(/\d+/);
  let num = numMatch ? parseInt(numMatch[0], 10) : 0;

  if (num < 1) num = 1; // 0 / missing / unparseable → Part 1

  const colorIndex = (Math.min(num, 5)) as 1 | 2 | 3 | 4 | 5;

  return {
    label: `${prefix} ${num}`,
    colorIndex,
  };
};
