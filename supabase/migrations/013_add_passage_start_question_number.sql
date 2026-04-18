-- Migration: 013_add_passage_start_question_number.sql
-- Description: Add start_question_number column to passages table to support custom numbering in practice tests.

-- 1. Add the column
ALTER TABLE public.passages 
ADD COLUMN start_question_number INTEGER DEFAULT NULL;

-- 2. Update the RPC function to handle the new column
-- (Re-deploying the updated logic)
CREATE OR REPLACE FUNCTION update_quiz_passages(
  p_quiz_id UUID,
  p_passages JSONB  -- Array of { title, content, sort_order, audio_start, audio_end, start_question_number, questions: [...] }
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_passage_record RECORD;
  v_question JSONB;
  v_passage_id UUID;
  v_passage_ids UUID[] := '{}';
  v_passage JSONB;
  v_sort_index INT := 0;
  v_q_sort_index INT;
BEGIN
  IF p_passages IS NULL OR jsonb_array_length(p_passages) = 0 THEN
    RAISE EXCEPTION 'Cannot update quiz with empty passages array';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM quizzes WHERE id = p_quiz_id) THEN
    RAISE EXCEPTION 'Quiz not found: %', p_quiz_id;
  END IF;

  DELETE FROM passages WHERE quiz_id = p_quiz_id;

  FOR v_passage IN SELECT * FROM jsonb_array_elements(p_passages)
  LOOP
    INSERT INTO passages (
      quiz_id, 
      title, 
      content, 
      sort_order, 
      audio_start, 
      audio_end,
      start_question_number
    )
    VALUES (
      p_quiz_id,
      v_passage->>'title',
      v_passage->>'content',
      COALESCE((v_passage->>'sort_order')::int, v_sort_index),
      (v_passage->>'audio_start')::numeric,
      (v_passage->>'audio_end')::numeric,
      (v_passage->>'start_question_number')::int
    )
    RETURNING id INTO v_passage_id;

    v_passage_ids := v_passage_ids || v_passage_id;

    v_q_sort_index := 0;
    IF v_passage->'questions' IS NOT NULL AND jsonb_typeof(v_passage->'questions') = 'array' THEN
      FOR v_question IN SELECT * FROM jsonb_array_elements(v_passage->'questions')
      LOOP
        INSERT INTO questions (
          passage_id, type, title, question_text, instructions,
          question_form, list_of_questions, list_of_options,
          matching_question, matrix_question, explanations, sort_order
        )
        VALUES (
          v_passage_id,
          v_question->>'type',
          v_question->>'title',
          v_question->>'question_text',
          v_question->>'instructions',
          v_question->>'question_form',
          CASE WHEN v_question->'list_of_questions' IS NOT NULL
               THEN v_question->'list_of_questions' ELSE NULL END,
          CASE WHEN v_question->'list_of_options' IS NOT NULL
               THEN v_question->'list_of_options' ELSE NULL END,
          CASE WHEN v_question->'matching_question' IS NOT NULL
               THEN v_question->'matching_question' ELSE NULL END,
          CASE WHEN v_question->'matrix_question' IS NOT NULL
               THEN v_question->'matrix_question' ELSE NULL END,
          CASE WHEN v_question->'explanations' IS NOT NULL
               THEN v_question->'explanations' ELSE NULL END,
          COALESCE((v_question->>'sort_order')::int, v_q_sort_index)
        );
        v_q_sort_index := v_q_sort_index + 1;
      END LOOP;
    END IF;

    v_sort_index := v_sort_index + 1;
  END LOOP;

  RETURN to_jsonb(v_passage_ids);
END;
$$;
