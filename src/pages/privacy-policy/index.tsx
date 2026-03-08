import { withMasterData, withMultipleWrapper } from "@/shared/hoc";
import { GetServerSideProps } from "next";
import type { PrivacyPolicyConfig } from "@/shared/types/admin-config";

export { PagePrivacyPolicy } from "./ui";

// Wrapper function để đọc privacy policy config
const withPrivacyPolicyConfig = async (
  context: Parameters<GetServerSideProps>[0]
) => {
  let privacyPolicyConfig: PrivacyPolicyConfig;

  try {
    // Gọi API route nội bộ để đọc config
    const protocol = context.req.headers["x-forwarded-proto"] || "http";
    const host = context.req.headers.host || "localhost:3000";
    const baseUrl = `${protocol}://${host}`;

    const res = await fetch(`${baseUrl}/api/admin/privacy-policy`, {
      headers: {
        cookie: context.req.headers.cookie || "",
      },
    });

    if (res.ok) {
      privacyPolicyConfig = await res.json();
    } else {
      throw new Error("Failed to fetch config");
    }
  } catch {
    // Nếu API route fail, dùng config mặc định
    privacyPolicyConfig = {
      banner: {
        title: "Privacy Policy",
        subtitle: "IELTS Prediction Privacy Policy Here",
        backgroundImage: "/img-admin/bg-image-11.jpg",
      },
      heroImage: "/img-admin/bg-image-11.jpg",
      content: {
        introTitle: "Welcome to IELTS Prediction Privacy Policy",
        introParagraphs: [
          "At IELTS Prediction, we are committed to protecting your privacy.",
        ],
        sections: [
          {
            title: "The Type of Personal Information We Collect",
            content: "We collect information that you provide directly to us.",
          },
        ],
      },
    };
  }

  return {
    props: {
      privacyPolicyConfig,
    },
  };
};

export const getServerSideProps: GetServerSideProps = withMultipleWrapper(
  withMasterData,
  withPrivacyPolicyConfig
);

