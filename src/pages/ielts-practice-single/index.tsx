import { withMasterData, withMultipleWrapper } from "@/shared/hoc";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { ROUTES } from "@/shared/routes";
import { createServerSupabase } from "~supabase/server";
import { getQuizBySlug, getRelatedQuizzes } from "~services/quiz";
import type { QuizWithPassages, Quiz } from "~services/types/database";
import type { IPracticeSingle } from "./api";

export { PageIELTSPracticeSingle } from "./ui";

/**
 * Map Supabase QuizWithPassages → legacy IPracticeSingle shape
 * so existing UI components continue to work without modification.
 */
function toIPracticeSingle(
  quiz: QuizWithPassages,
  relatedQuizzes: Quiz[],
  hasAccess: boolean
): IPracticeSingle {
  return {
    id: quiz.id,
    title: quiz.title,
    excerpt: quiz.excerpt ?? "",
    seo: {} as IPracticeSingle["seo"],
    link: `/ielts-practice-library/${quiz.slug}`,
    slug: quiz.slug,
    hasAccess,
    relatedPracticeQuizzes: relatedQuizzes.map((rq) => ({
      databaseId: 0,
      title: rq.title,
      featuredImage: rq.featured_image || false,
      excerpt: rq.excerpt ?? "",
      slug: rq.slug,
    })),
    author: {
      node: {
        userData: {},
        name: "IELTS Prediction",
      },
    },
    date: quiz.published_at ?? quiz.created_at,
    featuredImage: quiz.featured_image
      ? {
        node: {
          sourceUrl: quiz.featured_image,
          altText: quiz.title,
        },
      }
      : undefined,
    quizFields: {
      testsTaken: quiz.tests_taken ?? 0,
      proUserOnly: quiz.pro_user_only,
      type: [(quiz.type as "practice" | "academic" | "general"), quiz.type],
      skill: [quiz.skill, quiz.skill],
      time: quiz.time_minutes,
      scoreType: [(quiz.score_type ?? "band") as "band" | "percentage", quiz.score_type ?? "band"],
      audio: quiz.audio_url
        ? {
          node: {
            id: quiz.id,
            mediaItemUrl: quiz.audio_url,
            databaseId: 0,
          },
        }
        : undefined,
      passages: (quiz.passages ?? []).map((p) => ({
        title: p.title ?? "",
        passage_content: p.content ?? "",
        audio_start: p.audio_start?.toString(),
        audio_end: p.audio_end?.toString(),
        questions: (p.questions ?? []).map((q) => ({
          question_form: [
            (q.question_form ?? "uncategorized") as IPracticeSingle["quizFields"]["passages"][0]["questions"][0]["question_form"][0],
            q.question_form ?? "uncategorized",
          ],
          title: q.title ?? "",
          type: [
            q.type as IPracticeSingle["quizFields"]["passages"][0]["questions"][0]["type"][0],
            q.type,
          ],
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
          explanations: (q.explanations ?? []).map((e) => ({
            content: e.content,
          })),
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
      pdf: quiz.pdf_url
        ? {
          node: {
            id: quiz.id,
            mediaItemUrl: quiz.pdf_url,
            databaseId: 0,
          },
        }
        : undefined,
    },
  };
}

export const getServerSideProps: GetServerSideProps = withMultipleWrapper(
  withMasterData,
  async (context: GetServerSidePropsContext) => {
    const {
      query: { slug },
    } = context;
    const supabase = createServerSupabase(context);

    try {
      const quiz = await getQuizBySlug(supabase, slug?.toString() || "");

      if (!quiz) {
        return { notFound: true };
      }

      // Check Pro access: if quiz requires Pro and user is not Pro, redirect
      const { data: { user } } = await supabase.auth.getUser();
      let hasAccess = true;
      if (quiz.pro_user_only) {
        if (!user) {
          hasAccess = false;
        } else {
          const { data: profile } = await supabase
            .from("users")
            .select("is_pro, pro_expiration_date, roles")
            .eq("id", user.id)
            .single();

          const roles: string[] = Array.isArray(profile?.roles) ? profile.roles : [];
          const isPro =
            roles.includes("administrator") ||
            (profile?.is_pro &&
              profile?.pro_expiration_date &&
              new Date(profile.pro_expiration_date) > new Date());

          hasAccess = !!isPro;
        }
      }

      if (!hasAccess) {
        return {
          redirect: {
            destination: ROUTES.HOME,
            permanent: false,
          },
        };
      }

      // Get related quizzes
      const relatedQuizzes = await getRelatedQuizzes(supabase, quiz.id).catch(() => []);

      const post = toIPracticeSingle(quiz, relatedQuizzes, hasAccess);

      return {
        props: {
          post,
        },
      };
    } catch (error) {
      console.error("Error retrieving practice single:", error);
      throw error;
    }
  }
);
