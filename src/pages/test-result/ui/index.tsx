import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { useMemo } from "react";
import { useRouter } from "next/router";

import { SEOHeader } from "@/widgets";
import { useAuth } from "@/appx/providers";
import { ROUTES } from "@/shared/routes";
import { useProContentModal } from "@/shared/ui/pro-content";
import { calculateScore } from "@/shared/lib";
import {
  formatBandScore,
  formatResultLabel,
  getQuizScoreType,
} from "@/shared/lib/test-result-display";
import { Button } from "@/shared/ui/ds/atoms/button";
import { AppShell } from "@/widgets/layouts";

import type { IPracticeSingle, ITestResult, IUser } from "../api";
import AnswerKeys from "./answer-keys";

dayjs.extend(duration);

type PageTestResultProps = {
  post: IPracticeSingle;
  testResult: ITestResult;
  user: IUser;
  scoreData: ReturnType<typeof calculateScore>;
};

export function PageTestResult({
  post,
  testResult,
  user,
  scoreData,
}: PageTestResultProps) {
  const router = useRouter();
  const { currentUser } = useAuth();
  const openProContentModal = useProContentModal((state) => state.open);

  const numericScore = useMemo(() => {
    const liveScore = Number(scoreData.score);
    if (Number.isFinite(liveScore) && liveScore > 0) return liveScore;
    const savedScore = Number(testResult.testResultFields.score);
    if (Number.isFinite(savedScore)) return savedScore;
    return 0;
  }, [scoreData.score, testResult.testResultFields.score]);

  const timeSpent = useMemo(() => {
    const total = dayjs.duration({
      minutes: testResult.testResultFields.testTime,
    });

    const tlRaw = testResult.testResultFields.timeLeft || "0:0";
    const [mPart, sPart] = tlRaw.split(":");
    const mNum = Number(mPart) || 0;
    const sNum = Math.abs(Number(sPart) || 0);
    const remainingSecs = mNum < 0 ? mNum * 60 - sNum : mNum * 60 + sNum;

    const totalSecs = total.asSeconds();
    const percent =
      totalSecs > 0
        ? Math.round(
            (Math.max(0, totalSecs - remainingSecs) / totalSecs) * 100,
          )
        : 0;

    const sign = remainingSecs < 0 ? "-" : "";
    const absSecs = Math.abs(remainingSecs);
    const displayMinutes = Math.floor(absSecs / 60);
    const displaySeconds = absSecs % 60;
    const formattedTime = `${sign}${displayMinutes}:${String(displaySeconds).padStart(2, "0")}`;

    const totalTime = `${Number(total.minutes()) + total.hours() * 60}:${String(
      total.seconds(),
    ).padStart(2, "0")}`;

    return { totalTime, spent: formattedTime, percent };
  }, [
    testResult.testResultFields.testTime,
    testResult.testResultFields.timeLeft,
  ]);

  const skill = useMemo(() => post.quizFields.skill[0], [post.quizFields.skill]);
  const quizType = useMemo(
    () => post.quizFields.type?.[0] ?? "practice",
    [post.quizFields.type],
  );
  const scoreType = useMemo(
    () => getQuizScoreType(post.quizFields.scoreType),
    [post.quizFields.scoreType],
  );

  const isBandResult =
    quizType === "exam" ||
    quizType === "academic" ||
    quizType === "general";

  const displayScoreStr =
    formatResultLabel({
      quizType,
      scoreType,
      storedScore: testResult.testResultFields.score,
      scoreResult: scoreData,
      answers: testResult.testResultFields.answers,
    }) ??
    (isBandResult
      ? (formatBandScore(numericScore) ?? numericScore.toFixed(1))
      : `${scoreData.correctAns}/${scoreData.total_questions}`);

  const scoreLabel = isBandResult ? "Band Score" : "Câu đúng";

  // Accuracy %
  const accuracyPct =
    scoreData.total_questions > 0
      ? Math.round((scoreData.correctAns / scoreData.total_questions) * 100)
      : 0;

  // Passage breakdown
  const passageEntries = Object.entries(scoreData.details);

  // User display name/initials
  const userName = user.name || (currentUser as any)?.user_metadata?.name || "User";
  const initials = userName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const skillLabel = skill === "listening" ? "LISTENING" : skill === "reading" ? "READING" : skill.toUpperCase();
  const quizTypeLabel = quizType === "academic" ? "Academic" : quizType === "general" ? "General" : quizType === "exam" ? "Exam" : quizType === "practice" ? "Practice" : quizType;

  const submittedDate = dayjs(testResult.testResultFields.dateSubmitted || testResult.testResultFields.dateTaken).format("D MMM YYYY");

  // Keep hooks referenced; behavior stays unchanged.
  void openProContentModal;

  return (
    <>
      <SEOHeader fullHead="" title="Test Result | IELTS Exam Library" />

      <div className="flex flex-col gap-[28px]">

          {/* ── Page Header ── */}
          <div className="flex flex-col gap-[6px]">
            {/* Eyebrow */}
            <p className="text-eyebrow font-bold font-inter tracking-[8px] text-[#9ad534] uppercase">
              RESULTS · {skillLabel}
            </p>
            {/* Title */}
            <h1 className="font-display font-bold text-[26px] leading-normal text-[#191d24] whitespace-nowrap">
              {post.title}
            </h1>
            {/* Subtitle */}
            <p className="text-body-s font-inter text-[#6a7282]">
              Submitted {submittedDate} · {timeSpent.spent} · {quizTypeLabel}
            </p>
            {/* Action buttons */}
            <div className="flex items-center gap-[12px] mt-4">
              <Button
                variant="outlined"
                size="md"
                onClick={() => router.push(ROUTES.TAKE_THE_TEST(post.slug))}
              >
                Retake test
              </Button>
              <Button
                variant="dark"
                size="md"
                onClick={() => router.push(ROUTES.TEST_RESULT_EXPLANATION(testResult.id))}
              >
                Review answers
              </Button>
            </div>
          </div>

          {/* ── Score Hero row ── */}
          <div className="flex gap-[20px] items-stretch">

            {/* Band Score ring card */}
            <div className="bg-white border border-[rgba(25,29,36,0.1)] rounded-[24px] p-[26px] flex flex-col gap-[12px] items-center justify-center w-[340px] shrink-0">
              {/* Ring */}
              <div className="bg-[#b3e653] rounded-full w-[170px] h-[170px] flex items-center justify-center shrink-0">
                <div className="bg-white rounded-full w-[132px] h-[132px] flex flex-col items-center justify-center gap-[2px]">
                  <span className="font-display font-bold text-[46px] leading-none text-[#191d24]">
                    {displayScoreStr}
                  </span>
                  <span className="font-inter font-bold text-[11px] text-[#6a7282] uppercase tracking-wide">
                    {scoreLabel}
                  </span>
                </div>
              </div>
              <p className="font-inter font-medium text-[14px] text-[#6a7282]">
                Estimated band score
              </p>
              <p className="font-inter font-bold text-[15px] text-[#191d24]">
                {scoreData.correctAns} of {scoreData.total_questions} correct
              </p>
            </div>

            {/* Answer breakdown card */}
            <div className="bg-white border border-[rgba(25,29,36,0.1)] rounded-[24px] p-[26px] flex-1 flex flex-col justify-between min-w-0">
              <p className="font-display font-bold text-[18px] text-[#191d24]">
                Answer breakdown
              </p>

              {/* Segmented progress bar */}
              <div className="flex h-[14px] rounded-[8px] overflow-hidden w-full">
                {scoreData.total_questions > 0 && (
                  <>
                    <div
                      className="bg-[#b3e653] h-full"
                      style={{ flex: scoreData.correctAns }}
                    />
                    <div
                      className="bg-[#f96b8b] h-full"
                      style={{ flex: scoreData.incorrect }}
                    />
                    <div
                      className="bg-[#d9dee5] h-full"
                      style={{ flex: scoreData.missed }}
                    />
                  </>
                )}
              </div>

              {/* Legend */}
              <div className="flex gap-[24px] items-center">
                <div className="flex gap-[8px] items-center">
                  <span className="w-[12px] h-[12px] rounded-[4px] bg-[#b3e653] shrink-0" />
                  <span className="font-inter font-semibold text-[14px] text-[#191d24]">
                    Correct&nbsp;&nbsp;{scoreData.correctAns}
                  </span>
                </div>
                <div className="flex gap-[8px] items-center">
                  <span className="w-[12px] h-[12px] rounded-[4px] bg-[#f96b8b] shrink-0" />
                  <span className="font-inter font-semibold text-[14px] text-[#191d24]">
                    Incorrect&nbsp;&nbsp;{scoreData.incorrect}
                  </span>
                </div>
                <div className="flex gap-[8px] items-center">
                  <span className="w-[12px] h-[12px] rounded-[4px] bg-[#d9dee5] shrink-0" />
                  <span className="font-inter font-semibold text-[14px] text-[#191d24]">
                    Skipped&nbsp;&nbsp;{scoreData.missed}
                  </span>
                </div>
              </div>

              {/* Time info */}
              <div className="flex gap-[10px] items-center">
                <span className="material-symbols-rounded text-[18px] text-[#6a7282] leading-none">
                  schedule
                </span>
                <p className="font-inter text-[14px] text-[#6a7282]">
                  Completed in {timeSpent.spent} — time limit {timeSpent.totalTime}.
                </p>
              </div>
            </div>
          </div>

          {/* ── Stat Cards row ── */}
          <div className="flex gap-[20px]">
            {/* Accuracy */}
            <div className="bg-white border border-[rgba(25,29,36,0.1)] rounded-[24px] p-[22px] flex-1 flex flex-col gap-[10px]">
              <div className="bg-[rgba(179,230,83,0.16)] rounded-[12px] w-[42px] h-[42px]" />
              <div className="flex flex-col gap-[2px]">
                <span className="font-display font-bold text-[22px] text-[#191d24]">
                  {accuracyPct}%
                </span>
                <span className="font-inter text-[13px] text-[#6a7282]">Accuracy</span>
              </div>
            </div>
            {/* Score */}
            <div className="bg-white border border-[rgba(25,29,36,0.1)] rounded-[24px] p-[22px] flex-1 flex flex-col gap-[10px]">
              <div className="bg-[rgba(82,129,249,0.16)] rounded-[12px] w-[42px] h-[42px]" />
              <div className="flex flex-col gap-[2px]">
                <span className="font-display font-bold text-[22px] text-[#191d24]">
                  {displayScoreStr}
                </span>
                <span className="font-inter text-[13px] text-[#6a7282]">{scoreLabel}</span>
              </div>
            </div>
            {/* Time taken */}
            <div className="bg-white border border-[rgba(25,29,36,0.1)] rounded-[24px] p-[22px] flex-1 flex flex-col gap-[10px]">
              <div className="bg-[rgba(252,148,89,0.16)] rounded-[12px] w-[42px] h-[42px]" />
              <div className="flex flex-col gap-[2px]">
                <span className="font-display font-bold text-[22px] text-[#191d24]">
                  {timeSpent.spent}
                </span>
                <span className="font-inter text-[13px] text-[#6a7282]">Time taken</span>
              </div>
            </div>
            {/* Questions */}
            <div className="bg-white border border-[rgba(25,29,36,0.1)] rounded-[24px] p-[22px] flex-1 flex flex-col gap-[10px]">
              <div className="bg-[rgba(124,110,249,0.16)] rounded-[12px] w-[42px] h-[42px]" />
              <div className="flex flex-col gap-[2px]">
                <span className="font-display font-bold text-[22px] text-[#191d24]">
                  {scoreData.correctAns}/{scoreData.total_questions}
                </span>
                <span className="font-inter text-[13px] text-[#6a7282]">Correct answers</span>
              </div>
            </div>
          </div>

          {/* ── By passage breakdown ── */}
          {passageEntries.length > 0 && (
            <div className="bg-white border border-[rgba(25,29,36,0.1)] rounded-[24px] p-[26px] flex flex-col gap-[18px]">
              <p className="font-display font-bold text-[18px] text-[#191d24]">
                By {skill === "listening" ? "part" : "passage"}
              </p>
              {passageEntries.map(([key, part]) => {
                const totalInPassage = part.details.length;
                const correctInPassage = part.details.filter((d) => d.correct).length;
                const fillPct = totalInPassage > 0 ? correctInPassage / totalInPassage : 0;
                const partLabel = skill === "listening" ? "Part" : "Passage";
                return (
                  <div key={key} className="flex flex-col gap-[10px]">
                    <div className="flex items-center justify-between">
                      <span className="font-inter font-semibold text-[15px] text-[#191d24]">
                        {partLabel} {Number(key) + 1} — {part.questionRange}
                      </span>
                      <span className="font-inter font-bold text-[14px] text-[#191d24]">
                        {correctInPassage} / {totalInPassage}
                      </span>
                    </div>
                    <div className="bg-[#e5ebe0] h-[10px] rounded-[6px] w-full overflow-hidden max-w-[400px]">
                      <div
                        className="bg-[#b3e653] h-full rounded-[6px]"
                        style={{ width: `${fillPct * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Answer Key ── */}
          <div className="bg-white border border-[rgba(25,29,36,0.1)] rounded-[24px] p-[26px]">
            <AnswerKeys data={scoreData} skill={skill as "listening" | "reading"} />
          </div>

          {/* ── CTA row ── */}
          <div className="flex items-center gap-[12px]">
            <Button
              variant="dark"
              size="md"
              onClick={() => router.push(ROUTES.TEST_RESULT_EXPLANATION(testResult.id))}
            >
              Review all answers
            </Button>
            <Button
              variant="outlined"
              size="md"
              onClick={() => router.back()}
            >
              Back to tests
            </Button>
          </div>

      </div>
    </>
  );
}

PageTestResult.Layout = AppShell;
