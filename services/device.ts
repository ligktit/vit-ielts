/**
 * Device Service — Check & register device fingerprint
 *
 * Mỗi user lưu 1 device ID per device type (mobile/tablet/desktop)
 * trong JSONB column `users.devices`
 *
 * Structure: { mobile: { device_id: "xxx" }, desktop: { device_id: "yyy" } }
 *
 * @origin functions.php L2056–2120
 * @see LEGACY_CODEBASE_DOCS.md#2-4-device-fingerprint
 */

import { SupabaseClient } from "@supabase/supabase-js";

type DeviceType = "mobile" | "tablet" | "desktop";

type DeviceMap = Record<string, { device_id: string }>;

/**
 * Kiểm tra device ID có khớp với device đã đăng ký của user hay không
 *
 * @param supabase - Supabase client (browser hoặc SSR)
 * @param deviceId - FingerprintJS visitorId
 * @param deviceType - "mobile" | "tablet" | "desktop"
 * @returns true nếu device đã đăng ký và khớp
 */
export async function checkDevice(
    supabase: SupabaseClient,
    deviceId: string,
    deviceType: DeviceType,
): Promise<boolean> {
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: profile, error } = await supabase
        .from("users")
        .select("devices")
        .eq("id", user.id)
        .single();

    if (error) throw error;

    const devices: DeviceMap = profile?.devices ?? {};
    return devices[deviceType]?.device_id === deviceId;
}

/**
 * Đăng ký (lưu) device fingerprint cho user
 * Ghi đè device_id cũ nếu đã có cùng deviceType
 *
 * @param supabase - Supabase client
 * @param deviceId - FingerprintJS visitorId
 * @param deviceType - "mobile" | "tablet" | "desktop"
 */
export async function registerDevice(
    supabase: SupabaseClient,
    deviceId: string,
    deviceType: DeviceType,
): Promise<void> {
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile, error: fetchError } = await supabase
        .from("users")
        .select("devices")
        .eq("id", user.id)
        .single();

    if (fetchError) throw fetchError;

    const devices: DeviceMap = profile?.devices ?? {};
    devices[deviceType] = { device_id: deviceId };

    const { error } = await supabase
        .from("users")
        .update({ devices })
        .eq("id", user.id);

    if (error) throw error;
}
