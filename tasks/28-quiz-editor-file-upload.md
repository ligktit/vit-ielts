# Task 28 — Quiz Editor: File Upload

## Mô tả

Thêm chức năng upload file cho quiz: featured image, audio (Listening), PDF. Hiện tại chỉ có plain Input URL. Sử dụng Supabase Storage + `react-dropzone` (đã cài sẵn).

## Prerequisites

- Task 26 (Types & Constants)
- Supabase Storage bucket `quiz-assets` cần tạo trước

## Context cần đọc

- `pages/admin/quizzes/[id].tsx` L338-344 — Media card (plain Input URLs)
- `package.json` — `react-dropzone: ^14.3.8` (đã cài)
- `pages/api/admin/upload-image.ts` — upload route có sẵn (tham khảo)

## Công việc cụ thể

### 1. Tạo API route upload

**File tạo mới**: `pages/api/admin/upload.ts`

- Parse multipart form (formidable — đã cài)
- Upload file lên Supabase Storage bucket `quiz-assets`
- Return public URL
- Accept: images (jpg/png/webp), audio (mp3/wav/ogg), PDF
- Max size: 50MB (cho audio files)

### 2. Tạo FileUploadField component

**File tạo mới**: `src/features/admin-quiz/FileUploadField.tsx`

- Dùng `react-dropzone` cho drag & drop + click upload
- Hiển thị: dropzone → uploading spinner → preview/filename
- Image: preview thumbnail
- Audio: filename + play button (optional)
- PDF: filename + link
- Props: `accept`, `value` (current URL), `onChange` (new URL), `label`
- Delete button để xóa file đã upload

### 3. Tích hợp vào Media card

**File sửa**: `pages/admin/quizzes/[id].tsx`

Thay thế plain Input URLs trong Media card:

- `featured_image` → FileUploadField (accept: image/\*)
- `audio_url` → FileUploadField (accept: audio/\*)
- `pdf_url` → FileUploadField (accept: application/pdf)

## Files tạo mới

- `src/features/admin-quiz/FileUploadField.tsx`
- `pages/api/admin/upload.ts`

## Files sửa

- `pages/admin/quizzes/[id].tsx`

## KHÔNG chạm vào

- `services/quiz.ts`
- `pages/api/admin/upload-image.ts` (chỉ tham khảo)
- `pages/admin/quizzes/index.tsx`

## Acceptance Criteria

- [x] Upload API route hoạt động, return URL
- [x] FileUploadField component hiển thị đúng
- [x] Drag & drop hoặc click upload file thành công
- [x] Preview cho image, filename cho audio/PDF
- [x] URL lưu đúng vào quiz record
- [x] Delete file hoạt động
- [x] Build thành công
