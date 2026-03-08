// ieltspredictiontes\src\widgets\layouts\base\index.tsx

import { useAppContext, useAuth } from "@/appx/providers";
import { FloatingButton, Footer, SaleNotification } from "./ui";
import { Header } from "./ui/header";
import { ClipboardEvent, MouseEvent, useCallback, useEffect, useRef, useState } from "react";
import { useDeviceID } from "@/shared/hooks";
import { toast } from "react-toastify";
import { useLazyQuery } from "@/shared/graphql/compat";

// ========================================================================
// === DEVICE CHECKER: Kiểm tra thiết bị, chỉ chạy khi user đã login ===
// ========================================================================
const CHECK_DEVICE_QUERY = "";

const DeviceChecker = () => {
  const { signOut, isSignedIn } = useAuth();
  const getDeviceID = useDeviceID((state) => state.getDeviceID);
  const getDeviceType = useDeviceID((state) => state.getDeviceType);
  const [deviceId, setDeviceId] = useState<string>("");
  const hasLoggedOut = useRef(false); // Tránh gọi signOut nhiều lần

  const [checkMutation, { data }] = useLazyQuery(CHECK_DEVICE_QUERY, {
    variables: { deviceId, deviceType: getDeviceType() },
    context: { authRequired: true },
    fetchPolicy: "no-cache",
    onError: (error) => {
      console.error("CheckDevice Error:", error.message);
    }
  });

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
    if (data && !data.checkDevice && !hasLoggedOut.current) {
      hasLoggedOut.current = true; // Đánh dấu đã logout, tránh gọi lại
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
      {/* ======================================================================== */}
      {/* === BƯỚC 2: ĐẶT "THẰNG GÁC CỔNG" VÀO ĐÚNG CHỖ === */}
      {/* === Nó sẽ chỉ chạy trên các trang đã đăng nhập, không còn gây lỗi ở trang redirect nữa === */}
      {/* ======================================================================== */}
      <DeviceChecker />
      <Header />
      <main onCopy={handleCopy} onContextMenu={handleContextMenu}>
        {children}
      </main>
      <Footer />
      <SaleNotification />
      <FloatingButton />
    </>
  );
};