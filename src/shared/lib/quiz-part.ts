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
  
  // Extract number from string (e.g. "passage1" -> 1, "task-2" -> 2)
  const numMatch = partStr.match(/\d+/);
  let num = numMatch ? parseInt(numMatch[0], 10) : 0;
  
  /**
   * IMPORTANT: Handling legacy/CMS 0-indexing
   * If the CMS outputs "0", "1", "2" to mean Part 1, Part 2, Part 3,
   * we must shift it to 1-based indexing IF the raw string is just the number "0" or "1"
   * and there isn't a string prefix that implies 1-based.
   */
  if (partStr === "0" || partStr === "1" || partStr === "2" || partStr === "3") {
    // Usually 0-indexed in some arrays from DB
    // e.g. "0" -> Part 1
    num = parseInt(partStr, 10) + 1;
  } else if (num === 0) {
    num = 1; // Fallback
  }

  const colorIndex = (Math.min(Math.max(num, 1), 5)) as 1 | 2 | 3 | 4 | 5;

  return {
    label: `${prefix} ${num}`,
    colorIndex,
  };
};
