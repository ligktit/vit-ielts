# Task 03 — Scoring Engine

## Mô tả
Port `calculate_score()` từ PHP sang TypeScript. Đây là hàm chấm điểm IELTS quan trọng nhất (~440 dòng PHP), hỗ trợ 6 loại câu hỏi.

## Prerequisites
- Task 01 hoàn thành (types cần dùng)

## Context cần đọc
- `LEGACY_CODEBASE_DOCS.md` → **mục 4 (Scoring Engine)** — ĐỌC KỸ từng loại câu hỏi
- File PHP gốc: `wp-content/themes/findme-old/functions.php` lines 1014–1452
- File TS client hiện có: `src/shared/lib/calculateScore/` — tham khảo version client

## Công việc cụ thể

### 1. Tạo Type Definitions
**File tạo mới**: `services/types/quiz.ts`

```typescript
export type QuestionType = "radio" | "select" | "fillup" | "checkbox" | "matching" | "matrix";
export type MatchingLayoutType = "standard" | "summary" | "heading";

export type QuizQuestion = {
  id: string;
  type: QuestionType;
  title?: string;
  question_text?: string;
  instructions?: string;
  question_form?: string;
  sort_order: number;
  list_of_questions?: Array<{ question: string; correct: string; options: Array<{ option_text: string }> }>;
  list_of_options?: Array<{ option_text: string; correct: boolean }>;
  matching_question?: {
    layout_type: MatchingLayoutType;
    matching_items: Array<{ questionPart: string; correctAnswer: string }>;
    answer_options: Array<{ option_text: string }>;
    summary_text?: string;
  };
  matrix_question?: {
    matrix_categories: Array<{ category_letter: string; category_text: string }>;
    matrix_items: Array<{ item_text: string; correct_category_letter: string }>;
  };
  explanations?: Array<{ content: string }>;
};

export type QuizPassage = {
  id: string;
  title?: string;
  content?: string;
  sort_order: number;
  audio_start?: number;
  audio_end?: number;
  questions: QuizQuestion[];
};

export type QuizWithPassages = {
  id: string;
  title: string;
  passages: QuizPassage[];
};
```

### 2. Tạo Scoring Service
**File tạo mới**: `services/scoring.ts`

Port 1:1 từ PHP. Logic chi tiết theo `LEGACY_CODEBASE_DOCS.md` mục 4.2:

**extractWords()** helper:
```typescript
// Origin: functions.php L1456–1469
function extractWords(text: string): string[] {
  const regex = /\{(.*?)\}/g;
  const results: string[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match[1].trim() !== '') {
      results.push(match[1].trim().replace(/\s*\|\s*/g, '|'));
    }
  }
  return results;
}
```

**calculateScore()** — 6 question types:
- `radio` / `select`: So sánh index user_answer vs correct flag
- `fillup`: So sánh text case-insensitive, hỗ trợ "/" separator
- `checkbox`: So sánh mảng sorted indices (all-or-nothing)
- `matching` (3 layouts): standard/summary/heading — xem chi tiết trong docs
- `matrix`: So sánh category_letter

**Scoring formula**: `round((correct / total) * 9 * 2) / 2` (làm tròn đến 0.5)

### 3. Tạo Helper: extractWords
Đã gộp trong `services/scoring.ts`

### 4. Verify vs Client Version
Đọc `src/shared/lib/calculateScore/` và so sánh logic. Nếu có sai khác, ưu tiên logic PHP gốc.

## Files tạo mới
- `services/types/quiz.ts`
- `services/scoring.ts`

## KHÔNG chạm vào
- `src/shared/lib/calculateScore/` (client version — giữ nguyên, sẽ refactor sau)
- `src/shared/lib/extractWords/` (client version — giữ nguyên)
- Mọi file khác

## Acceptance Criteria
- [ ] `services/scoring.ts` export `calculateScore()` function
- [ ] Hỗ trợ 6 loại: radio, select, fillup, checkbox, matching (3 layouts), matrix
- [ ] Handle null/undefined/empty answers không crash
- [ ] Trả về score 0.0–9.0, bước 0.5
- [ ] File type definitions đầy đủ cho Quiz entities
- [ ] Comment `@origin` ghi rõ dòng PHP gốc
