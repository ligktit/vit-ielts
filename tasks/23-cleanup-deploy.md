# Task 23 — Cleanup + Deploy

## Mô tả
Xóa toàn bộ code/dependencies WordPress cũ, cập nhật environment, và deploy.

## Prerequisites
- **TẤT CẢ** tasks trước đã hoàn thành
- Data migration (Task 22) đã chạy thành công

## Context cần đọc
- `NEW_CODEBASE_ANALYSIS.md` → mục 12 (Dependencies), mục 13 (Env), mục 14 (File structure)

## Công việc cụ thể

### 1. Xóa Files Không Cần
```
XÓA:
├── wp-content/              # Toàn bộ WordPress
├── data/                    # JSON data files (đã migrate)
├── config/                  # CMS config files (đã migrate)  
├── lib/server/admin-config-helper.ts
├── lib/server/affiliate-data-helper.ts
├── lib/server/user-id-helper.ts
├── src/shared/graphql/      # Apollo Client setup
├── src/appx/providers/apollo-provider.tsx  # (đã xóa Task 02)
├── src/shared/hoc/withMasterData.tsx       # (đã thay Task 02)
└── scripts/                 # Migration scripts (sau khi chạy xong)
```

### 2. Remove Dependencies
```bash
npm uninstall @apollo/client apollo-upload-client graphql @vercel/kv sync-fetch @types/apollo-upload-client
```

### 3. Cleanup Imports
Tìm + xóa tất cả imports tham chiếu đến:
- `@apollo/client`
- `apollo-upload-client`
- `graphql`
- `@vercel/kv`
- `sync-fetch`
- `lib/server/admin-config-helper`
- `lib/server/affiliate-data-helper`
- `lib/server/user-id-helper`
- `src/shared/graphql`

### 4. Update Vercel Environment
XÓA:
```
NEXT_PUBLIC_WORDPRESS_CMS_URL
WP_ADMIN_USER
WP_ADMIN_PASSWORD
KV_REST_API_URL
KV_REST_API_TOKEN
```

THÊM:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

### 5. Build + Test
```bash
npm run build       # Verify no errors
npm run dev          # Manual testing
```

Test flow:
- [ ] Đăng ký → Đăng nhập → Xem profile
- [ ] Xem danh sách bài → Làm bài → Xem kết quả
- [ ] Mua Pro → Thanh toán (Sepay webhook) → Kích hoạt Pro
- [ ] Admin: quản lý users, quizzes, orders
- [ ] Admin: CMS content editing
- [ ] Affiliate: đăng ký → tạo link → track

### 6. Deploy
```bash
git add .
git commit -m "feat: complete WordPress to Supabase migration"
git push
```

### 7. Update Routes (nếu cần)
**File sửa**: `src/shared/routes/index.ts`
- Xóa `ADMIN.DASHBOARD: process.env.NEXT_PUBLIC_WORDPRESS_CMS_URL + "/wp-admin"`
- Đổi thành: `ADMIN.DASHBOARD: "/admin"`

## Files xóa
- Xem danh sách ở mục 1

## Files sửa
- `package.json` (remove deps)
- `src/shared/routes/index.ts`
- Bất kỳ file nào còn import cũ

## Acceptance Criteria
- [ ] `npm run build` thành công, 0 errors
- [ ] Không còn import WordPress/Apollo/KV
- [ ] Vercel env vars updated
- [ ] Full flow test passed
- [ ] Deploy thành công
