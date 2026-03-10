# Task 31 — Fix Question Data Integrity ✅ COMPLETED

> Ngày: 2026-03-10 | Hoàn thành: 2026-03-10 18:20

## Tổng quan

Sau migration từ WordPress, câu hỏi không hiển thị đúng trên frontend do 3 lỗi dữ liệu chính:

1. **Double-encoded JSONB** — Các field JSONB bị lưu dạng string thay vì object
2. **Sai Question Type** — 799/1129 câu hỏi bị gán `type=radio` do fallback mặc định
3. **Key name mismatch** — Database lưu camelCase nhưng mapping code chỉ check snake_case

---

## 1. Fix Double-encoded JSONB ✅

### Vấn đề

Các field JSONB trong table `questions` (`list_of_questions`, `list_of_options`, `matching_question`, `matrix_question`, `explanations`) bị lưu dạng string `"[{...}]"` thay vì native JSONB `[{...}]`.

### Nguyên nhân

Migration script (`migrate-wp-data.ts`) pass JavaScript objects tới `.insert()` — Supabase stringified lần thứ 2.

### Giải pháp

- Script `scripts/fix-question-jsonb.js` — audit + fix tất cả JSONB fields
- Migration script thêm helper `ensureJsonb()` để parse strings trước khi insert

### Kết quả

- **0 fields** còn bị double-encoded (verified)

---

## 2. Fix Question Types ✅

### Vấn đề

799/1129 câu hỏi bị gán `type=radio` vì migration script dùng `q.type || "radio"` làm fallback.

### Phân bổ SAI trước khi fix

| Type       | Count |
| ---------- | ----- |
| `radio`    | 1,123 |
| `fillup`   | 3     |
| `matching` | 2     |
| `matrix`   | 1     |

### Phân bổ ĐÚNG sau khi fix

| Type       | Count |
| ---------- | ----- |
| `fillup`   | 342   |
| `radio`    | 324   |
| `matrix`   | 183   |
| `matching` | 167   |
| `checkbox` | 111   |
| `select`   | 2     |

### Giải pháp

- Script `scripts/fix-question-types.js` — phát hiện type đúng dựa trên data thực tế:
  - Có `list_of_questions[].question` + options → `radio`
  - Có `question_text` chứa `{gaps}` + `list_of_options` → `select`
  - Có `question_text` chứa `{gaps}` (không options) → `fillup`
  - Có `list_of_options` (không gaps) → `checkbox`
  - Có `matching_question` data → `matching`
  - Có `matrix_question` data → `matrix`
- Migration script thêm `detectType()` function thay cho `q.type || "radio"`

---

## 3. Fix Matching/Matrix Key Mismatch ✅

### Vấn đề

Database lưu camelCase keys (từ WP GraphQL):

```json
{ "layoutType": ["standard"], "answerOptions": [...], "matchingItems": [...] }
```

Nhưng SSR mapping code chỉ check snake_case:

```ts
matchingQ.answer_options; // ❌ undefined — DB key là answerOptions
matchingQ.layout_type; // ❌ undefined — DB key là layoutType
```

→ `answerOptions` array luôn trống → matching questions không hiện đáp án.

Ngoài ra, `layoutType` bị lưu dạng **array** (`["standard"]`) thay vì string.

### Giải pháp

Fixed mapping trong 3 files SSR để handle **cả camelCase và snake_case**, + flatten array layoutType:

```ts
// Trước (chỉ check snake_case)
layoutType: matchingQ.layout_type ?? null,
answerOptions: (Array.isArray(matchingQ.answer_options) ? matchingQ.answer_options : [])

// Sau (check cả 2)
layoutType: (() => {
  const lt = matchingQ.layout_type ?? matchingQ.layoutType ?? null;
  return Array.isArray(lt) ? lt[0] : lt;
})(),
answerOptions: (Array.isArray(matchingQ.answer_options) ? matchingQ.answer_options
  : Array.isArray(matchingQ.answerOptions) ? matchingQ.answerOptions : [])
```

### Kết quả

- **166/166** matching questions map đúng `answerOptions` ✅
- **183** matrix questions map đúng `matrixCategories` + `matrixItems` ✅
- 1 câu duy nhất (`Questions 14-18` trong cam-20) có data rỗng từ gốc WP

---

## 4. Null Safety cho `parse()` ✅

### Vấn đề

Component `parse()` (html-react-parser) crash khi nhận `null`/`undefined`.

### Giải pháp

Thêm `|| ""` fallback cho tất cả `parse()` calls trong:

- `radio.tsx` — `subQ.question`, `option.content`
- `checkbox.tsx` — `option.option`, `explanations[0].content`
- `matrix-question.tsx` — `category.categoryText`, `item.itemText`
- `matching-question.tsx` — 18+ instances

---

## Files đã thay đổi

### Scripts (chạy 1 lần)

| File                            | Mục đích                         |
| ------------------------------- | -------------------------------- |
| `scripts/fix-question-jsonb.js` | Audit + fix double-encoded JSONB |
| `scripts/fix-question-types.js` | Fix question types dựa trên data |

### Migration Script

| File                         | Thay đổi                             |
| ---------------------------- | ------------------------------------ |
| `scripts/migrate-wp-data.ts` | Thêm `ensureJsonb()`, `detectType()` |

### SSR Mapping (camelCase + snake_case)

| File                                        | Thay đổi                    |
| ------------------------------------------- | --------------------------- |
| `src/pages/take-the-test/index.tsx`         | Fix matching/matrix mapping |
| `src/pages/test-result/index.tsx`           | Fix matching/matrix mapping |
| `src/pages/ielts-practice-single/index.tsx` | Fix matching/matrix mapping |

### Frontend Null Safety

| File                                                          | Thay đổi              |
| ------------------------------------------------------------- | --------------------- |
| `src/shared/ui/exam/question-render/ui/radio.tsx`             | `parse()` null safety |
| `src/shared/ui/exam/question-render/ui/checkbox.tsx`          | `parse()` null safety |
| `src/shared/ui/exam/question-render/ui/fillup.tsx`            | Already safe          |
| `src/shared/ui/exam/question-render/ui/select.tsx`            | Already safe          |
| `src/shared/ui/exam/question-render/ui/matrix-question.tsx`   | `parse()` null safety |
| `src/shared/ui/exam/question-render/ui/matching-question.tsx` | `parse()` null safety |

### Utility

| File                             | Mục đích                                      |
| -------------------------------- | --------------------------------------------- |
| `services/lib/safeParseJsonb.ts` | Safely parse potentially double-encoded JSONB |

---

## Lưu ý cho agent tiếp theo

> [!IMPORTANT]
>
> - Database `questions` table dùng **camelCase** keys cho JSONB fields (`layoutType`, `answerOptions`, `matchingItems`, `matrixCategories`, `matrixItems`...) — KHÔNG phải snake_case.
> - `layoutType` bị lưu dạng **array** (`["standard"]`) — luôn cần flatten: `Array.isArray(lt) ? lt[0] : lt`.
> - Khi thêm page/component mới đọc `matching_question` hoặc `matrix_question`, phải check **cả camelCase và snake_case** keys.

> [!WARNING]
>
> - 1 câu hỏi matching (`Questions 14-18`, cam-20-reading-test-1) có data rỗng hoàn toàn trong database — cần re-import từ WP hoặc nhập thủ công qua admin.
> - Nếu chạy lại migration, script mới đã có `ensureJsonb()` và `detectType()` — không cần chạy fix scripts riêng.
