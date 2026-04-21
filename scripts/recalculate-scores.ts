import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { calculateScore } from '../services/scoring';

dotenv.config({ path: '.env.local' });

async function runMigration() {
  console.log("Starting score recalculation migration...");
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing Supabase credentials in .env.local");
      return;
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  // 1. Fetch all test results
  const { data: testResults, error: trErr } = await supabase
    .from('test_results')
    .select('id, quiz_id, score, answers, test_part')
    .order('submitted_at', { ascending: false });
    
  if (trErr || !testResults) {
    console.error('Failed to fetch test_results:', trErr);
    return;
  }

  console.log(`Found ${testResults.length} test results to analyze.`);

  // Cache quizzes to prevent duplicate queries
  const quizCache = new Map<string, any>();
  let updatedCount = 0;

  for (const result of testResults) {
      // Get Quiz
      let fullQuiz = quizCache.get(result.quiz_id);
      if (!fullQuiz) {
          const { data: quizData, error: qErr } = await supabase
            .from("quizzes")
            .select('*, passages(*, questions(*))')
            .eq("id", result.quiz_id)
            .single();
            
          if (qErr || !quizData) {
              console.warn(`Could not load quiz ${result.quiz_id} for result ${result.id}`);
              continue; // Skip if quiz deleted
          }

          const sortedPassages = (quizData.passages || [])
            .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
            .map((p: any) => {
                const questions = p.questions ?? [];
                return {
                    ...p,
                    questions: questions.sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
                };
            });

          fullQuiz = {
             ...quizData,
             passages: sortedPassages
          };
          quizCache.set(result.quiz_id, fullQuiz);
      }

      const userAnswersRaw = result.answers?.answers || result.answers;
      const testPart = result.test_part;

      // Ensure answers format doesn't break
      if (!userAnswersRaw) continue;

      const newScoreResult = calculateScore(userAnswersRaw, fullQuiz as any, testPart);

      // We determine if we need an update
      // result.score is stored as decimal
      const oldScore = result.score;
      const newScore = newScoreResult.score;
      
      const oldCorrect = result.answers?.totalCorrect;
      const newCorrect = newScoreResult.totalCorrect;
      
      const oldTotalQs = result.answers?.totalQuestions;
      const newTotalQs = newScoreResult.totalQuestions;

      // Are they different?
      if (oldScore !== newScore || oldCorrect !== newCorrect || oldTotalQs !== newTotalQs) {
          console.log(`Mismatch on Result ${result.id} [Quiz ID: ${result.quiz_id}]:`);
          console.log(` - Score: ${oldScore} => ${newScore}`);
          console.log(` - Correct/Total: ${oldCorrect}/${oldTotalQs} => ${newCorrect}/${newTotalQs}`);
          
          const answersWithBreakdown = {
              ...(result.answers?.answers ? result.answers : { answers: result.answers }),
              totalCorrect: newScoreResult.totalCorrect,
              totalQuestions: newScoreResult.totalQuestions,
          };

          const { error: updateErr } = await supabase
            .from('test_results')
            .update({ 
               score: newScore,
               answers: answersWithBreakdown 
            })
            .eq('id', result.id);

          if (updateErr) {
             console.error(`Failed to update result ${result.id}`, updateErr);
          } else {
             console.log(` > Successfully updated result ${result.id}`);
             updatedCount++;
          }
      }
  }

  console.log(`Migration complete! Successfully updated ${updatedCount} out of ${testResults.length} test results.`);
}

runMigration();
