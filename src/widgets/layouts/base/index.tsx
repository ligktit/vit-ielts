import { useAppContext, useAuth } from "@/appx/providers";
import { FloatingButton, Footer, SaleNotification } from "./ui";
import { Header } from "./ui/header";
import { ClipboardEvent, MouseEvent, useCallback, useEffect, useRef, useState } from "react";
import { useDeviceID } from "@/shared/hooks";
import { toast } from "react-toastify";
import { checkDevice } from "~services/device";
import { createClient } from "~supabase/client";

const DeviceChecker = () => {
  const { signOut, isSignedIn } = useAuth();
  const getDeviceID = useDeviceID((state) => state.getDeviceID);
  const getDeviceType = useDeviceID((state) => state.getDeviceType);
  const [deviceId, setDeviceId] = useState<string>("");
  const hasLoggedOut = useRef(false);
  const [data, setData] = useState<any>(null);

  const checkMutation = useCallback(async () => {
    if (!deviceId || !isSignedIn) return;
    try {
      const supabase = createClient();
      const result = await checkDevice(supabase, deviceId, getDeviceType() as any);
      setData({ checkDevice: result });
    } catch (error) {
      console.error("CheckDevice Error:", error);
    }
  }, [deviceId, isSignedIn, getDeviceType]);

  useEffect(() => {
    // Chỉ lấy deviceId khi user đã login
    if (isSignedIn) {
      getDeviceID().then((id) => setDeviceId(id));
    }
  }, [getDeviceID, isSignedIn]);

  const checkBlur = useCallback(() => {
    // Chỉ check device khi user đã login và có deviceId
    if (deviceId && isSignedIn && !hasLoggedOut.current) {
      checkMutation();
    }
  }, [checkMutation, deviceId, isSignedIn]);

  useEffect(() => {
    if (deviceId && isSignedIn) {
      checkMutation(); // Kiểm tra khi component được tải
      window.addEventListener("focus", checkBlur);
      return () => {
        window.removeEventListener("focus", checkBlur);
      };
    }
  }, [checkBlur, deviceId, checkMutation, isSignedIn]);

  useEffect(() => {
    // Only logout if check_device explicitly returns false (not null/undefined/error)
    if (data && data.checkDevice === false && !hasLoggedOut.current) {
      hasLoggedOut.current = true;
      toast.error("Your account has been logged in from another device, you will be logged out.");
      signOut();
    }
  }, [data, signOut]);

  return null;
}

export const BaseLayout = ({ children }: { children: React.ReactNode }) => {
  const { masterData } = useAppContext();

  const handleCopy = (event: ClipboardEvent<HTMLElement>) => {
    if (
      masterData?.websiteOptions.websiteOptionsFields.generalSettings
        .preventCopy
    ) {
      event.preventDefault();
    }
  };

  const handleContextMenu = (event: MouseEvent<HTMLElement>) => {
    if (
      masterData?.websiteOptions.websiteOptionsFields.generalSettings
        .preventCopy
    ) {
      event.preventDefault();
    }
  };

  return (
    <>
      {/* DeviceChecker tạm tắt: legacy `users.devices` rows từ thời RPC
          `check_device` đang chứa device_id không khớp với FingerprintJS
          visitorId hiện tại, khiến mọi user cũ bị đá ra ngay khi login. Bật
          lại sau khi migrate data và làm logic lenient (overwrite slot thay
          vì kick out). */}
      {/* <DeviceChecker /> */}
      {/* === SECTION: Header (Top Bar + Navigation) === */}
      <Header />
      {/* === SECTION: Main Content === */}
      <main data-section="main-content" onCopy={handleCopy} onContextMenu={handleContextMenu}>
        {children}
      </main>
      {/* === SECTION: Footer === */}
      <Footer />
      <SaleNotification />
      <FloatingButton />
    </>
  );
};