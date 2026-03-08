# Task 22 — Migration Issues (To Fix Later)

> Ngày: 2026-03-09 | Scripts: `scripts/run-migration.mjs`, `scripts/run-wp-migration.mjs`

## ✅ Đã migrate thành công

| Table | Rows | Nguồn |
|---|---|---|
| quizzes | 298 | WP GraphQL (basic info) |
| mock_tests | 3 | WP GraphQL |
| orders | 13 | `data/orders.json` |
| posts | 7 | WP GraphQL |
| cms_configs | 17 | `config/*.json` |
| affiliates | 1 | `data/affiliates.json` |
| affiliate_links | 5 | `data/affiliate-links.json` |
| affiliate_visits | 4 | `data/affiliate-visits.json` |
| commissions | 6 | `data/affiliate-commissions.json` |

## ❌ Chưa migrate — Cần sửa

### 1. Users (0 rows)
- **Vấn đề**: WP REST API `/wp/v2/users` trả 401 (Unauthorized). GraphQL trả ~3,094 users nhưng chỉ có `name`, `email` — thiếu `meta` fields (is_pro, target_score, devices, roles...).
- **Nguyên nhân**: `supabase.auth.admin.createUser()` cần password, WP không expose password.
- **Giải pháp gợi ý**:
  - Dùng WP Application Passwords plugin để fix REST API 401
  - Hoặc tạo auth users với password random rồi yêu cầu reset password
  - Cần lấy user meta từ WP REST API (context=edit) để có đầy đủ fields

### 2. Passages & Questions (0 rows)
- **Vấn đề**: GraphQL query cho nested ACF fields bị lỗi `Cannot query field`.
- **Nguyên nhân**: Tên field trong ACF GraphQL schema khác với tên đã dùng trong script. Ví dụ `passages` có thể cần query qua tên khác.
- **Giải pháp gợi ý**:
  - Chạy introspection query: `{ __type(name:"Quiz_Quizfields") { fields { name } } }` để tìm đúng tên
  - Thử probe từng field: `quizFields { passages { title } }` rồi thêm dần nested fields
  - Quizzes đã có 298 records (slug-based), chỉ cần thêm passages/questions sau

### 3. Test Results (24,009 records found, 0 inserted)
- **Vấn đề**: Cần mapping `wp_user_id → supabase_uuid` và `wp_quiz_id → supabase_uuid`
- **Nguyên nhân**: Users chưa migrate → không có user ID mapping
- **Giải pháp gợi ý**: Migrate users trước, tạo mapping file, rồi chạy test results migration

### 4. Sample Essays (0 rows)
- **Vấn đề**: GraphQL query `sampleEssayFields { skill part... }` trả lỗi `Cannot query type "SampleEssayFields"`
- **Nguyên nhân**: Tên ACF field group trong GraphQL schema khác
- **Giải pháp gợi ý**:
  - Introspect: `{ __type(name:"SampleEssay") { fields { name } } }` — đã xác nhận type tồn tại
  - Tìm đúng tên field group cho ACF fields (có thể là `writingSampleEssayFields` hoặc tương tự)
  - Basic query (title, slug, content) hoạt động OK

### 5. Site Settings & Menus (0 rows)
- **Vấn đề**: Chưa có trong migration script
- **Giải pháp gợi ý**: Tạo script fetch WordPress Options + Menus qua REST/GraphQL

### 6. Coupons (0 rows)
- **Vấn đề**: `data/coupons.json` có thể rỗng hoặc format khác
- **Giải pháp gợi ý**: Kiểm tra nội dung file `data/coupons.json`

## Ghi chú kỹ thuật

- **WP GraphQL endpoint**: `https://cms.ieltspredictiontest.com/graphql`
- **WP Auth**: Basic Auth với `WP_ADMIN_USER` + `WP_ADMIN_PASSWORD` (trong `.env.local`)
- **Node version**: v20.20.0
- **ESM issue**: `.ts` scripts không chạy được với `ts-node`/`tsx` do `@supabase/supabase-js` v2 ESM-only. Dùng `.mjs` thay thế.
