# Task 24 — Fix API Error Handling Bugs

## Mô tả

Audit API routes phát hiện 15 routes trả về 500 thay vì mã lỗi chính xác. Cần fix error handling patterns.

## Prerequisites

- Không phụ thuộc task nào khác

## Công việc cụ thể

### 1. Fix `[object Object]` trong error messages (5 routes)

**Nguyên nhân**: Supabase `PostgrestError` không phải `Error` instance → `String(error)` = `[object Object]`

**Files cần sửa:**

- `pages/api/coupons/apply.ts` — line ~32
- `pages/api/affiliate/stats.ts` — line ~30
- `pages/api/affiliate/links.ts` — line ~94, ~144
- `pages/api/affiliate/commissions.ts` — line ~32, ~55
- `pages/api/affiliate/visits.ts` — line ~27, ~50

**Cách fix:** Trong catch block:

```diff
- message: error instanceof Error ? error.message : String(error),
+ message: error instanceof Error ? error.message : (error as any)?.message ?? String(error),
```

### 2. Fix Invalid ID → 500 thay vì 404 (5 admin routes)

**Nguyên nhân**: `.single()` throw `PostgrestError` code `PGRST116` khi không tìm thấy row

**Files cần sửa:**

- `pages/api/admin/quizzes/[id].ts` — GET handler
- `pages/api/admin/orders/[id].ts` — GET handler
- `pages/api/admin/posts/[id].ts` — GET handler
- `pages/api/admin/sample-essays/[id].ts` — GET handler
- `pages/api/admin/quizzes/[id]/clone.ts` — POST handler

**Cách fix:**

```typescript
} catch (error) {
    const pgErr = error as any;
    if (pgErr?.code === "PGRST116") {
        return res.status(404).json({ success: false, error: "Not found" });
    }
    return res.status(500).json({ ... });
}
```

### 3. Fix `save-draft` & `submit` trả 500 thay vì 401 (2 routes)

**Nguyên nhân**: Service throw error chứa "đăng nhập" nhưng API catch trả 500 thay vì 401

**Files cần sửa:**

- `pages/api/test-flow/save-draft.ts`
- `pages/api/test-flow/submit.ts`

**Cách fix:** Copy status code logic từ `start.ts`:

```typescript
const errorMessage =
  error instanceof Error ? error.message : "Internal server error";
const statusCode = errorMessage.includes("đăng nhập")
  ? 401
  : errorMessage.includes("PRO")
    ? 403
    : 500;
return res.status(statusCode).json({ success: false, error: errorMessage });
```

### 4. Fix `orders/create` lỗi với payload hợp lệ

**File**: `pages/api/orders/create.ts`
**Kiểm tra**: `createOrder` service có xử lý `temp_` userId đúng không → check `services/order.ts`

### 5. Fix `affiliate/register` lỗi với fake userId

**File**: `pages/api/affiliate/register.ts`
**Kiểm tra**: Service functions có validate UUID format trước khi query không

## KHÔNG chạm vào

- `services/` layer (chỉ fix API route handlers)
- Frontend components
- CMS config routes (đang hoạt động tốt)

## Acceptance Criteria

- [x] Không còn `[object Object]` trong bất kỳ error response nào
- [x] Invalid ID trả 404, không phải 500
- [x] Unauthenticated request trả 401, không phải 500
- [x] `orders/create` hoạt động hoặc trả lỗi rõ ràng
- [x] `affiliate/register` xử lý invalid userId gracefully
