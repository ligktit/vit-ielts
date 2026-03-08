# Hướng dẫn cấu hình ImgBB API (Giải pháp fallback cho upload hình)

## Tại sao cần ImgBB API?

Khi không có Vercel Blob Storage được cấu hình, hệ thống sẽ tự động sử dụng ImgBB API như một giải pháp fallback để upload hình ảnh.

## Cách lấy ImgBB API Key miễn phí:

### Bước 1: Đăng ký tài khoản ImgBB
1. Truy cập https://api.imgbb.com/
2. Click **"Get API Key"** hoặc **"Sign Up"**
3. Đăng ký tài khoản miễn phí (chỉ cần email)

### Bước 2: Lấy API Key
1. Sau khi đăng nhập, vào trang **"API"** hoặc **"Dashboard"**
2. Copy **API Key** của bạn (có dạng: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)

### Bước 3: Thêm vào Vercel Environment Variables
1. Vào Vercel Dashboard → Project của bạn
2. Vào **Settings** → **Environment Variables**
3. Click **Add New**
4. Nhập:
   - **Name**: `IMGBB_API_KEY`
   - **Value**: Paste API key đã copy
   - **Environment**: Chọn tất cả (Production, Preview, Development)
5. Click **Save**

### Bước 4: Redeploy
1. Vào tab **Deployments**
2. Click **...** (3 chấm) trên deployment mới nhất → **Redeploy**

## Lưu ý:

- **Giới hạn miễn phí**: ImgBB free tier cho phép upload không giới hạn số lượng hình ảnh
- **Kích thước file**: Tối đa 32MB mỗi file
- **Bảo mật**: API key sẽ được lưu trong Environment Variables, không hiển thị trong code
- **URL trả về**: Hình ảnh sẽ được lưu trên ImgBB và trả về URL công khai

## Ưu tiên sử dụng:

1. **Vercel Blob Storage** (nếu đã cấu hình `BLOB_READ_WRITE_TOKEN`)
2. **ImgBB API** (nếu đã cấu hình `IMGBB_API_KEY` và không có Blob Storage)
3. **Local filesystem** (chỉ khi chạy local development)

## Troubleshooting:

### Lỗi: "IMGBB_API_KEY chưa được cấu hình"
- Kiểm tra xem đã thêm environment variable chưa
- Đảm bảo đã redeploy sau khi thêm variable
- Kiểm tra API key có đúng format không

### Lỗi: "ImgBB upload failed"
- Kiểm tra API key có hợp lệ không
- Kiểm tra kích thước file có vượt quá 32MB không
- Kiểm tra định dạng file có được hỗ trợ không (JPG, PNG, GIF, WebP)

