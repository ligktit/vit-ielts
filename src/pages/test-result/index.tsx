import { withAuth, withMasterData, withMultipleWrapper } from "@/shared/hoc";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { createServerSupabase } from "~supabase/server";
import { getTestResult } from "~services/test-flow";
import { getQuizBySlug } from "~services/quiz";
import { getUserProfile } from "~services/user";
import { calculateScore } from "@/shared/lib";
import type { ITestResult, IUser, IPracticeSingle } from "./api";
import type { QuizWithPassages } from "~services/types/database";

export { PageTestResult } from "./ui";

/**
 * Map Supabase QuizWithPassages → legacy IPracticeSingle shape for test-result page
 */
function toIPracticeSingle(quiz: QuizWithPassages): IPracticeSingle {
  return {
    id: quiz.id,
    title: quiz.title,
    excerpt: quiz.excerpt ?? "",
    seo: {} as IPracticeSingle["seo"],
    link: `/ielts-practice-library/${quiz.slug}`,
    slug: quiz.slug,
    author: {
      node: { name: "IELTS Prediction" },
    },
    date: quiz.published_at ?? quiz.created_at,
    featuredImage: quiz.featured_image
      ? { node: { sourceUrl: quiz.featured_image, altText: quiz.title } }
      : undefined,
    quizFields: {
      testsTaken: quiz.tests_taken ?? 0,
      proUserOnly: quiz.pro_user_only,
      type: [quiz.type, quiz.type],
      skill: [quiz.skill, quiz.skill],
      time: quiz.time_minutes,
      scoreType: [quiz.score_type ?? "band", quiz.score_type ?? "band"],
      audio: quiz.audio_url
        ? { node: { id: quiz.id, mediaItemUrl: quiz.audio_url } }
        : undefined,
      passages: (quiz.passages ?? []).map((p) => ({
        title: p.title ?? "",
        passage_content: p.content ?? "",
        questions: (p.questions ?? []).map((q) => ({
          question_form: [q.question_form ?? "uncategorized", q.question_form ?? "uncategorized"] as [string, string],
          title: q.title ?? "",
          type: [q.type, q.type] as [string, string],
          question: q.question_text ?? undefined,
          instructions: q.instructions ?? undefined,
          list_of_questions: q.list_of_questions?.map((lq) => ({
            question: lq.question,
            correct: typeof lq.correct === "string" ? parseInt(lq.correct, 10) || 0 : Number(lq.correct),
            options: (lq.options ?? []).map((o) => ({
              content: o.option_text ?? (o as any).content ?? "",
            })),
          })) ?? undefined,
          list_of_options: q.list_of_options?.map((lo) => ({
            option: lo.option_text ?? (lo as any).option ?? "",
            correct: lo.correct,
          })) ?? undefined,
          explanations: (q.explanations ?? []).map((e) => ({ content: e.content })),
          matchingQuestion: q.matching_question
            ? {
              layoutType: q.matching_question.layout_type,
              summaryText: q.matching_question.summary_text ?? "",
              matchingItems: q.matching_question.matching_items.map((mi) => ({
                questionPart: mi.questionPart,
                correctAnswer: mi.correctAnswer,
              })),
              answerOptions: q.matching_question.answer_options.map((ao) => ({
                optionText: ao.option_text ?? (ao as any).optionText ?? "",
              })),
            }
            : undefined,
          matrixQuestion: q.matrix_question
            ? {
              matrixCategories: q.matrix_question.matrix_categories.map((mc) => ({
                categoryLetter: mc.category_letter ?? (mc as any).categoryLetter ?? "",
                categoryText: mc.category_text ?? (mc as any).categoryText ?? "",
              })),
              matrixItems: q.matrix_question.matrix_items.map((mi) => ({
                itemText: mi.item_text ?? (mi as any).itemText ?? "",
                correctCategoryLetter: mi.correct_category_letter ?? (mi as any).correctCategoryLetter ?? "",
              })),
              layoutType: (q.matrix_question as any).layout_type ?? "standard",
              legendTitle: (q.matrix_question as any).legend_title ?? "",
            }
            : undefined,
        })),
      })),
    },
  };
}

export const getServerSideProps: GetServerSideProps = withMultipleWrapper(
  withAuth,
  withMasterData,
  async (context: GetServerSidePropsContext) => {
    const {
      query: { id },
    } = context;
    const supabase = createServerSupabase(context);

    // 1. Fetch test result from Supabase
    const testResultRow = await getTestResult(supabase, id?.toString() || "");

    if (!testResultRow || testResultRow.status !== "published") {
      return { notFound: true };
    }

    // 2. Fetch quiz data
    const quiz = await getQuizBySlug(supabase, "").catch(() => null);
    // Actually we need to get quiz by ID, not slug. Let's query directly.
    let quizData: QuizWithPassages | null = null;
    {
      const { data, error } = await supabase
        .from("quizzes")
        .select(`*, passages(*, questions(*))`)
        .eq("id", testResultRow.quiz_id)
        .single();
      if (!error && data) {
        // Sort nested data
        const sorted = {
          ...data,
          passages: ((data as any).passages ?? [])
            .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
            .map((p: any) => ({
              ...p,
              questions: (p.questions ?? []).sort(
                (a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
              ),
            })),
        };
        quizData = sorted as QuizWithPassages;
      }
    }

    if (!quizData) {
      return { notFound: true };
    }

    const post = toIPracticeSingle(quizData);

    // 3. Fetch user profile
    const userProfile = await getUserProfile(supabase, testResultRow.user_id).catch(() => null);

    const user: IUser = {
      name: userProfile?.name ?? "",
      userData: {
        avatar: userProfile?.avatar_url
          ? {
            node: {
              mediaDetails: {
                sizes: [{ sourceUrl: userProfile.avatar_url, width: "96" }],
              },
              srcSet: userProfile.avatar_url,
            },
          }
          : undefined,
      },
    };

    // 4. Build legacy testResult shape
    const answers = testResultRow.answers ?? { answers: [] };
    const testPart = testResultRow.test_part ?? [];

    const testResult: ITestResult = {
      id: testResultRow.id,
      testResultFields: {
        answers: typeof answers === "string" ? answers : JSON.stringify(answers),
        dateSubmitted: testResultRow.submitted_at ?? testResultRow.created_at,
        dateTaken: testResultRow.created_at,
        score: testResultRow.score ?? 0,
        quiz: {
          node: {
            id: quizData.id,
          },
        },
        testPart: typeof testPart === "string" ? testPart : JSON.stringify(testPart),
        testTime: testResultRow.test_time ?? 0,
        timeLeft: testResultRow.time_left ?? "0",
      },
      status: testResultRow.status === "published" ? "publish" : "draft",
      authorId: testResultRow.user_id,
    };

    // 5. Calculate score
    const parsedAnswers = typeof answers === "string" ? JSON.parse(answers) : answers;
    const parsedTestPart = typeof testPart === "string" ? JSON.parse(testPart) : testPart;

    const scoreData = calculateScore(
      parsedAnswers.answers ?? [],
      post,
      parsedTestPart
    );

    return {
      props: {
        post,
        testResult,
        user,
        scoreData,
      },
    };
  }
);
