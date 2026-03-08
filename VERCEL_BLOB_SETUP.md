# Hướng dẫn cấu hình Vercel Blob Storage

## Bước 1: Tạo Blob Store trong Vercel Dashboard

1. Đăng nhập vào [Vercel Dashboard](https://vercel.com/dashboard)
2. Chọn project của bạn
3. Vào tab **Storage** (hoặc **Data** → **Storage**)
4. Click **Create Database** hoặc **Add Storage**
5. Chọn **Blob**
6. Đặt tên cho Blob Store (ví dụ: `blob-storage`)
7. Chọn region gần nhất (ví dụ: `sin1` cho Singapore)
8. Click **Create**

## Bước 2: Lấy Blob Token

Sau khi tạo Blob Store:

1. Click vào Blob Store vừa tạo
2. Vào tab **Settings** hoặc **.env.local**
3. Tìm **Read and Write Token** hoặc **BLOB_READ_WRITE_TOKEN**
4. Copy token này (bắt đầu bằng `vercel_blob_rw_...`)

**Lưu ý**: Nếu không thấy token, có thể cần tạo token mới:
- Vào **Settings** → **Tokens**
- Click **Create Token**
- Chọn quyền **Read and Write**
- Copy token được tạo

## Bước 3: Thêm Environment Variable vào Vercel

1. Vào Vercel Dashboard → Project của bạn
2. Vào **Settings** → **Environment Variables**
3. Click **Add New**
4. Nhập:
   - **Name**: `BLOB_READ_WRITE_TOKEN`
   - **Value**: Paste token đã copy ở Bước 2
   - **Environment**: Chọn tất cả (Production, Preview, Development) hoặc chỉ Production
5. Click **Save**

## Bước 4: Redeploy Project

1. Vào tab **Deployments**
2. Tìm deployment mới nhất
3. Click **...** (3 chấm) → **Redeploy**
4. Hoặc push một commit mới lên GitHub để trigger auto-deploy

## Bước 5: Kiểm tra

Sau khi redeploy, thử upload file trong admin dashboard. Nếu thành công, file sẽ được lưu trên Vercel Blob Storage và có URL công khai.

## Troubleshooting

### Lỗi: "BLOB_READ_WRITE_TOKEN chưa được cấu hình"
- Kiểm tra xem đã thêm environment variable chưa
- Đảm bảo đã redeploy sau khi thêm variable
- Kiểm tra token có đúng format không (bắt đầu bằng `vercel_blob_rw_`)

### Lỗi: "Unauthorized" hoặc "Invalid token"
- Token có thể đã hết hạn hoặc bị thu hồi
- Tạo token mới và cập nhật lại environment variable

### File upload thành công nhưng không hiển thị
- Kiểm tra URL trả về từ API
- Đảm bảo blob có quyền `public` access
- Kiểm tra CORS settings nếu cần

## Lưu ý

- Vercel Blob Storage có giới hạn dung lượng miễn phí (thường là 1GB)
- File được lưu với quyền public, có thể truy cập qua URL
- Không thể upload file vào filesystem trên Vercel (read-only)

