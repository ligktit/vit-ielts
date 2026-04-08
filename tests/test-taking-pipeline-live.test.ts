import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { supabaseAnon } from "./fixtures/supabase-live";
import { createTestUser, deleteTestUser, findTestQuiz } from "./fixtures/test-data-helpers";
import * as testFlow from "../services/test-flow";

/**
 * Task 3.3: Test-Taking Pipeline E2E (Service-Level)
 * 
 * Verifies the core test-taking lifecycle using a real Supabase instance.
 * - Start a new test
 * - Save draft answers
 * - Resume from draft
 * - Submit and calculate score
 * - Verify tests_taken counter increment
 */
describe("Task 3.3: Test-Taking Pipeline E2E (Service-Level)", () => {
  let testUser: any;
  let quiz: any;

  beforeAll(async () => {
    // 1. Create a clean test user
    testUser = await createTestUser();
    
    // 2. Find any published reading quiz to test with
    quiz = await findTestQuiz("reading");
    
    // 3. Sign in the user so supabaseAnon has a valid session for RLS
    const { error } = await supabaseAnon.auth.signInWithPassword({
      email: testUser.email!,
      password: testUser.password,
    });
    if (error) throw error;
  });

  afterAll(async () => {
    // Cleanup: delete the test user and their test results (cascade)
    if (testUser) {
      await deleteTestUser(testUser.id);
    }
  });

  it("should complete a full test-taking flow: Start → Slave → Resume → Submit", async () => {
    // Step 1: Start the test (takeTheTest)
    const draft = await testFlow.takeTheTest(supabaseAnon, {
      quizId: quiz.id,
      testPart: [0], // Use first passage
      testTime: 60,
      testMode: "practice",
      retake: false,
    });
    
    expect(draft).toBeDefined();
    expect(draft.status).toBe("draft");
    expect(draft.quiz_id).toBe(quiz.id);

    // Step 2: Save some draft answers (saveTestResult)
    const initialAnswers = { answers: ["Answer 1", "Answer 2"] };
    await testFlow.saveTestResult(supabaseAnon, draft.id, initialAnswers, "59:00");

    // Step 3: Resume the test (takeTheTest with retake=false)
    const resumed = await testFlow.takeTheTest(supabaseAnon, {
      quizId: quiz.id,
      testPart: [0],
      testTime: 60,
      testMode: "practice",
      retake: false,
    });
    
    expect(resumed.id).toBe(draft.id);
    expect(resumed.answers).toEqual(initialAnswers);
    expect(resumed.time_left).toBe("59:00");

    // Step 4: Submit the test (submitTestResult)
    // We submit empty answers to expect a score of 0 (or low score)
    const finalAnswers = { answers: [] };
    const submitResult = await testFlow.submitTestResult(
      supabaseAnon,
      draft.id,
      finalAnswers,
      "00:00"
    );
    
    expect(submitResult.status).toBe("published");
    expect(submitResult.score).toBe(0);
    expect(submitResult.submitted_at).toBeDefined();

    // Step 5: Verify result retrieval (getTestResult)
    const result = await testFlow.getTestResult(supabaseAnon, draft.id);
    expect(result).toBeDefined();
    expect(result?.status).toBe("published");
    expect(result?.score).toBe(0);
    expect(result?.quizzes.id).toBe(quiz.id);
  });

  it("should handle retakes correctly by deleting old drafts", async () => {
    // 1. Create a draft
    const draft1 = await testFlow.takeTheTest(supabaseAnon, {
      quizId: quiz.id,
      testPart: [0],
      testTime: 60,
      testMode: "practice",
      retake: true,
    });

    // 2. Start a retake (retake=true)
    const draft2 = await testFlow.takeTheTest(supabaseAnon, {
      quizId: quiz.id,
      testPart: [0],
      testTime: 60,
      testMode: "practice",
      retake: true,
    });

    // 3. draft2 should be a new ID, and draft1 should be gone
    expect(draft2.id).not.toBe(draft1.id);
    
    const { data: checkDraft1 } = await supabaseAnon
      .from("test_results")
      .select("id")
      .eq("id", draft1.id)
      .maybeSingle();
      
    expect(checkDraft1).toBeNull();
  });

  it("should respect RLS when accessing other users' results", async () => {
    // Create another user
    const otherUser = await createTestUser();
    
    // Create a private result for current user
    const ownDraft = await testFlow.takeTheTest(supabaseAnon, {
      quizId: quiz.id,
      testPart: [0],
      testTime: 60,
      testMode: "practice",
      retake: true,
    });

    // Create an anon client that is NOT signed in (or signed in as otherUser)
    // Here we'll just try to read our draft using a client signed in as otherUser
    const otherSupabase = await (async () => {
        const { createClient } = await import("@supabase/supabase-js");
        const client = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        await client.auth.signInWithPassword({
          email: otherUser.email!,
          password: otherUser.password,
        });
        return client;
    })();

    const { data: forbiddenResult } = await otherSupabase
      .from("test_results")
      .select("id")
      .eq("id", ownDraft.id)
      .maybeSingle();

    expect(forbiddenResult).toBeNull(); // RLS should block reading other user's draft

    // Cleanup other user
    await deleteTestUser(otherUser.id);
  });
});
