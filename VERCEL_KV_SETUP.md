# Hướng dẫn Setup Vercel KV cho Admin Panel

## Vấn đề
Khi deploy lên Vercel, admin panel không thể lưu config vì Vercel sử dụng read-only filesystem. Code đã được cập nhật để sử dụng Vercel KV trên production và filesystem trên localhost.

## Các bước setup

### 1. Tạo Vercel KV Database
1. Vào Vercel Dashboard
2. Chọn project của bạn
3. Vào tab **Storage**
4. Click **Create Database** → Chọn **KV**
5. Đặt tên database (ví dụ: `kv-config`)
6. Chọn region gần nhất

### 2. Lấy Environment Variables
Sau khi tạo KV database, Vercel sẽ tự động tạo 2 environment variables:
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

### 3. Migrate Config từ Filesystem sang KV (Lần đầu)
Khi deploy lần đầu, bạn cần migrate các config files từ localhost sang KV:

**Option 1: Sử dụng script migration (khuyến nghị) ✅**

Script migration đã được tạo sẵn tại `scripts/migrate-to-kv.ts`. Các bước:

1. **Pull environment variables từ Vercel:**
   ```bash
   vercel env pull .env.local
   ```
   Lệnh này sẽ tạo file `.env.local` với các KV credentials.

2. **Chạy script migration:**
   ```bash
   npm run migrate:kv
   ```
   Hoặc:
   ```bash
   npx ts-node scripts/migrate-to-kv.ts
   ```

3. **Kiểm tra kết quả:**
   Script sẽ hiển thị:
   - ✓ Success: số lượng config đã migrate thành công
   - ✗ Failed: số lượng config bị lỗi (nếu có)

**Option 2: Manual migration**
1. Deploy code lên Vercel
2. Vào admin panel trên Vercel
3. Mở từng trang config và click Save
4. Config sẽ được tự động lưu vào KV khi bạn edit

### 4. Verify Setup
1. Deploy code lên Vercel
2. Vào admin panel trên Vercel
3. Thử edit một config và save
4. Kiểm tra Vercel KV dashboard để xem data đã được lưu

## Cách hoạt động

- **Localhost**: Sử dụng filesystem (đọc/ghi từ thư mục `config/`)
- **Vercel Production**: Sử dụng Vercel KV (đọc/ghi từ KV database)

Code tự động detect environment và chọn storage phù hợp:
- Nếu có `KV_REST_API_URL` và `KV_REST_API_TOKEN` và đang ở production → dùng KV
- Ngược lại → dùng filesystem

## Troubleshooting

### Lỗi "Config không tồn tại trong KV"
- Chạy migration script để copy config từ filesystem sang KV
- Hoặc edit config trên admin panel để tạo mới trong KV

### Lỗi "Failed to initialize Vercel KV"
- Kiểm tra environment variables đã được set đúng chưa
- Kiểm tra `@vercel/kv` package đã được cài đặt chưa

### Config không được lưu trên Vercel
- Kiểm tra KV database đã được tạo chưa
- Kiểm tra environment variables trong Vercel dashboard
- Kiểm tra logs trên Vercel để xem lỗi cụ thể