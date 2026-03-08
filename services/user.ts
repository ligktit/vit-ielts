/**
 * User Service — Profile CRUD, Pro status, Pro activation
 *
 * Thay thế:
 * - functions.php L728–745 (UpdateUser)
 * - functions.php L755–773 (Pro status check)
 * - functions.php L1664–1746 (UpdateUserTargetScore)
 * - sepay.ts L94–145 (calculateProExpirationDate)
 *
 * @see LEGACY_CODEBASE_DOCS.md#9-user-management
 * @see LEGACY_CODEBASE_DOCS.md#2-5-pro-status-logic
 */

import { SupabaseClient } from "@supabase/supabase-js";
import dayjs from "dayjs";

// ============================================================
// Types
// ============================================================

type UserProfileUpdate = {
    name?: string;
    avatar_url?: string;
    gender?: string;
    date_of_birth?: string;
    phone_number?: string;
};

type TargetScoreUpdate = {
    reading?: number;
    listening?: number;
    speaking?: number;
    writing?: number;
    exam_date?: string;
};

type ProStatus = {
    isPro: boolean;
    expirationDate: string | null;
};

// ============================================================
// Functions
// ============================================================

/**
 * Lấy user profile từ bảng users
 *
 * @param supabase - Supabase client (browser hoặc SSR)
 * @param userId - UUID của user
 * @returns User profile hoặc null nếu không tìm thấy
 */
export async function getUserProfile(supabase: SupabaseClient, userId: string) {
    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

    if (error) throw error;
    return data;
}

/**
 * Cập nhật thông tin profile cơ bản
 *
 * @origin functions.php L728–745 (graphql_user_object_mutation_update_additional_data)
 */
export async function updateUserProfile(
    supabase: SupabaseClient,
    userId: string,
    update: UserProfileUpdate,
) {
    const { data, error } = await supabase
        .from("users")
        .update(update)
        .eq("id", userId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Cập nhật target score (JSONB column)
 *
 * @origin functions.php L1664–1746 (UpdateUserTargetScore)
 */
export async function updateTargetScore(
    supabase: SupabaseClient,
    userId: string,
    score: TargetScoreUpdate,
) {
    const { data, error } = await supabase
        .from("users")
        .update({ target_score: score })
        .eq("id", userId)
        .select("target_score")
        .single();

    if (error) throw error;
    return data;
}

/**
 * Kiểm tra Pro status của user
 * Admin (roles chứa 'administrator') luôn trả về isPro = true
 *
 * @origin functions.php L755–773
 * @param supabase - Supabase client
 * @param userId - UUID
 * @returns { isPro, expirationDate }
 */
export async function checkProStatus(
    supabase: SupabaseClient,
    userId: string,
): Promise<ProStatus> {
    const { data, error } = await supabase
        .from("users")
        .select("is_pro, pro_expiration_date, roles")
        .eq("id", userId)
        .single();

    if (error) throw error;
    if (!data) return { isPro: false, expirationDate: null };

    // Admin luôn Pro
    const roles: string[] = Array.isArray(data.roles) ? data.roles : [];
    if (roles.includes("administrator")) {
        return { isPro: true, expirationDate: data.pro_expiration_date };
    }

    // Check is_pro flag + expiration date chưa qua
    if (!data.is_pro || !data.pro_expiration_date) {
        return { isPro: false, expirationDate: data.pro_expiration_date };
    }

    const isExpired = new Date(data.pro_expiration_date) < new Date();
    return {
        isPro: !isExpired,
        expirationDate: data.pro_expiration_date,
    };
}

/**
 * Kích hoạt tài khoản Pro cho user
 * Logic cộng dồn: nếu đang Pro chưa hết hạn → cộng thêm tháng vào ngày hết hạn hiện tại
 *
 * ⚠️ Dùng supabaseAdmin (service_role) vì bypass RLS
 *
 * @origin sepay.ts L94–145 (calculateProExpirationDate)
 * @param supabaseAdmin - Supabase admin client (service_role)
 * @param userId - UUID
 * @param durationMonths - Số tháng cần kích hoạt
 */
export async function activateProAccount(
    supabaseAdmin: SupabaseClient,
    userId: string,
    durationMonths: number,
) {
    // Lấy trạng thái Pro hiện tại
    const { data: user, error: fetchError } = await supabaseAdmin
        .from("users")
        .select("is_pro, pro_expiration_date")
        .eq("id", userId)
        .single();

    if (fetchError) throw fetchError;

    // Tính ngày hết hạn mới
    const newExpirationDate = calculateProExpirationDate(
        user?.pro_expiration_date ?? null,
        durationMonths,
        user?.is_pro ?? false,
    );

    // Update user
    const { data, error } = await supabaseAdmin
        .from("users")
        .update({
            is_pro: true,
            pro_expiration_date: newExpirationDate,
        })
        .eq("id", userId)
        .select("is_pro, pro_expiration_date")
        .single();

    if (error) throw error;
    return data;
}

// ============================================================
// Helpers (internal)
// ============================================================

/**
 * Tính ngày hết hạn Pro mới
 * Hỗ trợ nhiều format đầu vào: "YYYY-MM-DD", "YYYYMMDD"
 *
 * Logic:
 * - Nếu user đã Pro + chưa hết hạn → cộng thêm duration tháng vào ngày hết hạn hiện tại
 * - Nếu chưa Pro hoặc đã hết hạn → cộng duration tháng từ ngày hiện tại
 *
 * @origin sepay.ts L94–145
 * @returns Ngày hết hạn mới format "YYYY-MM-DD"
 */
export function calculateProExpirationDate(
    currentExpirationDate: string | null | undefined,
    duration: number,
    isPro: boolean = false,
): string {
    const now = dayjs();

    // Parse ngày hết hạn hiện tại (nếu có)
    const parseDate = (dateStr: string): dayjs.Dayjs => {
        // Format ACF legacy: "YYYYMMDD"
        if (/^\d{8}$/.test(dateStr)) {
            return dayjs(dateStr, "YYYYMMDD");
        }
        // Format ISO: "YYYY-MM-DD"
        return dayjs(dateStr);
    };

    // Nếu có ngày hết hạn hiện tại
    if (currentExpirationDate) {
        const currentExp = parseDate(currentExpirationDate);

        // Cộng thêm nếu ngày hết hạn còn trong tương lai
        if (currentExp.isValid() && currentExp.isAfter(now)) {
            return currentExp.add(duration, "month").format("YYYY-MM-DD");
        }
    }

    // Mặc định: tính từ ngày hiện tại
    return now.add(duration, "month").format("YYYY-MM-DD");
}
