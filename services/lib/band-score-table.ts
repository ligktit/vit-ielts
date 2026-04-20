/**
 * IELTS Band Score Conversion Tables
 *
 * Official IELTS band score lookup based on number of correct answers.
 * Used by both server-side scoring (services/test-flow.ts) and
 * client-side display (exam-item, quiz-listing, test-result page).
 *
 * @see https://www.ielts.org/for-test-takers/how-ielts-is-scored
 */

type BandEntry = { band: number; min: number; max: number };

/**
 * IELTS Listening Band Score Conversion Table.
 * Also used for Reading Academic (same conversion).
 */
const LISTENING_BANDS: BandEntry[] = [
    { band: 9.0, min: 39, max: 40 },
    { band: 8.5, min: 37, max: 38 },
    { band: 8.0, min: 35, max: 36 },
    { band: 7.5, min: 33, max: 34 },
    { band: 7.0, min: 30, max: 32 },
    { band: 6.5, min: 27, max: 29 },
    { band: 6.0, min: 23, max: 26 },
    { band: 5.5, min: 20, max: 22 },
    { band: 5.0, min: 16, max: 19 },
    { band: 4.5, min: 13, max: 15 },
    { band: 4.0, min: 10, max: 12 },
    { band: 3.5, min: 7, max: 9 },
    { band: 3.0, min: 5, max: 6 },
    { band: 2.5, min: 3, max: 4 },
    { band: 2.0, min: 1, max: 2 },
];

/**
 * IELTS Reading General Training Band Score Conversion Table.
 * General Training requires more correct answers per band than Academic.
 */
const READING_GENERAL_BANDS: BandEntry[] = [
    { band: 9.0, min: 40, max: 40 },
    { band: 8.5, min: 39, max: 39 },
    { band: 8.0, min: 37, max: 38 },
    { band: 7.5, min: 36, max: 36 },
    { band: 7.0, min: 34, max: 35 },
    { band: 6.5, min: 32, max: 33 },
    { band: 6.0, min: 30, max: 31 },
    { band: 5.5, min: 27, max: 29 },
    { band: 5.0, min: 23, max: 26 },
    { band: 4.5, min: 19, max: 22 },
    { band: 4.0, min: 15, max: 18 },
    { band: 3.5, min: 12, max: 14 },
    { band: 3.0, min: 9, max: 11 },
    { band: 2.5, min: 6, max: 8 },
    { band: 2.0, min: 1, max: 5 },
];

function lookupFromTable(correctAnswers: number, table: BandEntry[]): number {
    if (correctAnswers <= 0) return 0;

    for (const entry of table) {
        if (correctAnswers >= entry.min && correctAnswers <= entry.max) {
            return entry.band;
        }
    }

    // Above maximum → highest band
    if (correctAnswers > table[0].max) return table[0].band;

    // Below minimum → 0
    return 0;
}

const FULL_TEST_TYPES = new Set(["exam", "academic", "general"]);

/**
 * Check if a quiz type is a full IELTS test (mock/exam).
 */
export function isFullTestType(quizType: string | null | undefined): boolean {
    return quizType != null && FULL_TEST_TYPES.has(quizType);
}

/**
 * Look up IELTS band score from number of correct answers.
 * Uses official IELTS conversion tables.
 *
 * @param correctAnswers - Number of correct answers (0–40)
 * @param skill - Quiz skill: "listening" or "reading"
 * @param quizType - Quiz type: "exam", "academic", "general", "practice"
 * @returns Band score (0.0–9.0, step 0.5)
 */
export function lookupBandScore(
    correctAnswers: number,
    skill: string,
    quizType?: string | null,
): number {
    // Reading General Training uses a different (harder) table
    if (skill === "reading" && quizType === "general") {
        return lookupFromTable(correctAnswers, READING_GENERAL_BANDS);
    }

    // Listening + Reading Academic use the same table
    return lookupFromTable(correctAnswers, LISTENING_BANDS);
}
