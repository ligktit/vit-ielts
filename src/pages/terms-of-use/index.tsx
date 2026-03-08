import { withMasterData, withMultipleWrapper } from "@/shared/hoc";
import { GetServerSideProps } from "next";
import type { TermsOfUseConfig } from "@/shared/types/admin-config";

export { PageTermsOfUse } from "./ui";

// Wrapper function để đọc terms of use config
const withTermsOfUseConfig = async (
  context: Parameters<GetServerSideProps>[0]
) => {
  let termsOfUseConfig: TermsOfUseConfig;

  try {
    // Gọi API route nội bộ để đọc config
    const protocol = context.req.headers["x-forwarded-proto"] || "http";
    const host = context.req.headers.host || "localhost:3000";
    const baseUrl = `${protocol}://${host}`;

    const res = await fetch(`${baseUrl}/api/admin/terms-of-use`, {
      headers: {
        cookie: context.req.headers.cookie || "",
      },
    });

    if (res.ok) {
      termsOfUseConfig = await res.json();
    } else {
      throw new Error("Failed to fetch config");
    }
  } catch {
    // Nếu API route fail, dùng config mặc định
    termsOfUseConfig = {
      banner: {
        title: "Terms of Service",
        subtitle: "IELTS Prediction Terms of Service Here",
        backgroundImage: "/img-admin/bg-image-11.jpg",
      },
      heroImage: "/img-admin/bg-image-11.jpg",
      content: {
        introTitle: "Welcome to IELTS Prediction Terms of Service",
        introParagraphs: [
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        ],
        sections: [
          {
            title: "1. Acceptance of Terms",
            content: "Please read these terms carefully.",
          },
        ],
      },
    };
  }

  return {
    props: {
      termsOfUseConfig,
    },
  };
};

export const getServerSideProps: GetServerSideProps = withMultipleWrapper(
  withMasterData,
  withTermsOfUseConfig
);

