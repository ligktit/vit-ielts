# Task 22 — Data Migration Scripts

## Mô tả
Tạo scripts chuyển dữ liệu từ WordPress MySQL + JSON files sang Supabase PostgreSQL.

## Prerequisites
- Task 01 (Supabase schema đã tạo)

## Context cần đọc
- `NEW_CODEBASE_ANALYSIS.md` → mục 10 (Data Migration Scripts)
- `LEGACY_CODEBASE_DOCS.md` → mục 3.1 (Data Model), mục 11 (Data Storage)

## Công việc cụ thể

### 1. User Migration
**File tạo mới**: `scripts/migrate-wp-users.ts`

Flow:
- WordPress REST API: `GET /wp-json/wp/v2/users?per_page=100&page={n}&context=edit`
- Auth: Basic Auth (WP_ADMIN_USER:WP_ADMIN_PASSWORD)
- Tạo Supabase auth user: `supabaseAdmin.auth.admin.createUser({ email, password: randomTemp })`
- Insert public.users: { id, email, name, avatar_url, is_pro, pro_expiration_date, target_score, gender, date_of_birth, devices, roles }
- Mapping: tạo file `scripts/user-id-mapping.json` → { wp_id: supabase_uuid }

### 2. Quiz Migration
**File tạo mới**: `scripts/migrate-wp-quizzes.ts`

Flow:
- WP REST API: `GET /wp-json/wp/v2/quiz?per_page=100&page={n}&status=any`
- Mỗi quiz: lấy ACF fields (passages, questions nested)
- Insert quizzes table
- Insert passages table (quiz_id FK)
- Insert questions table (passage_id FK)
- Giữ mapping: wp_quiz_id → supabase_quiz_uuid

### 3. Test Results Migration
**File tạo mới**: `scripts/migrate-wp-test-results.ts`

Flow:
- WP REST API: `GET /wp-json/wp/v2/test-result?per_page=100&page={n}&status=any`
- Map user_id + quiz_id qua mapping files
- Insert test_results table

### 4. Mock Tests + Collections Migration
**File tạo mới**: `scripts/migrate-wp-mock-tests.ts`

### 5. Posts Migration
**File tạo mới**: `scripts/migrate-wp-posts.ts`

### 6. Sample Essays Migration
**File tạo mới**: `scripts/migrate-wp-sample-essays.ts`

### 7. JSON Data Migration
**File tạo mới**: `scripts/migrate-json-data.ts`

Migrate all JSON files:
- `data/orders.json` → orders table (map user_id)
- `data/coupons.json` → coupons table
- `data/affiliates.json` → affiliates table (map user_id)
- `data/affiliate-links.json` → affiliate_links table
- `data/affiliate-visits.json` → affiliate_visits table
- `data/affiliate-commissions.json` → commissions table

### 8. Config Migration
**File tạo mới**: `scripts/migrate-configs.ts`

- 17 files `config/*.json` → cms_configs table
- WordPress options → site_settings table
- WordPress menus → menus table

### 9. Master Migration Script
**File tạo mới**: `scripts/migrate-all.ts`

Chạy tất cả scripts theo đúng thứ tự:
1. Users (tạo mapping)
2. Quizzes + Passages + Questions (tạo mapping)
3. Mock Tests + Collections
4. Test Results (dùng mappings)
5. Posts
6. Sample Essays
7. JSON Data (Orders, Affiliates, Coupons)
8. Configs

## Files tạo mới
- `scripts/migrate-wp-users.ts`
- `scripts/migrate-wp-quizzes.ts`
- `scripts/migrate-wp-test-results.ts`
- `scripts/migrate-wp-mock-tests.ts`
- `scripts/migrate-wp-posts.ts`
- `scripts/migrate-wp-sample-essays.ts`
- `scripts/migrate-json-data.ts`
- `scripts/migrate-configs.ts`
- `scripts/migrate-all.ts`
- `scripts/user-id-mapping.json` (generated)
- `scripts/quiz-id-mapping.json` (generated)

## KHÔNG chạm vào
- Source data files (chỉ đọc)
- Supabase schema (đã tạo Task 01)
- Mọi file khác

## Acceptance Criteria
- [ ] Tất cả scripts chạy thành công
- [ ] Users: auth.users + public.users populated
- [ ] Quizzes: quiz + passages + questions populated
- [ ] Test Results: mapped user_id + quiz_id
- [ ] JSON data: all 6 files migrated
- [ ] Configs: 17 CMS configs + site settings + menus
- [ ] ID mappings: wp_id → supabase_uuid
