import { create } from "zustand";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { isDesktop, isMobile, isTablet } from "react-device-detect";

type State = {
  deviceId: string;
  getDeviceID: () => Promise<string>;
  getDeviceType: () => "desktop" | "mobile" | "tablet";
};

export const useDeviceID = create<State>((set, get) => ({
  deviceId: "",
  getDeviceID: async () => {
    if (!get().deviceId) {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      // Cookies.set("device_id", result.visitorId, { expires: 30 }); // 30 ngày
      set({ deviceId: result.visitorId });
      return result.visitorId;
    }
    return get().deviceId;
  },
  getDeviceType: () => {
    if (isDesktop) return "desktop";
    if (isMobile) return "mobile";
    if (isTablet) return "tablet";
    return "desktop";
  },
}));
