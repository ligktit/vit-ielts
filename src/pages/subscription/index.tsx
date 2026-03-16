import { withMasterData, withMultipleWrapper } from "@/shared/hoc";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import type { FAQConfig, SubscriptionBannerConfig } from "@/shared/types/admin-config";
import { createServerSupabase } from "~supabase/server";
import { readConfig } from "~services/cms-config";

export { PageSubscription } from "./ui";

// Type definition (giữ nguyên cho UI)
interface TestimonialsConfig {
  title: string;
  description: string;
  button: { text: string; link: string };
  testimonials: Array<{
    name: string;
    title: string;
    company: string;
    quote: string;
    avatar: string;
  }>;
}

/**
 * Subscription page — fetch 3 CMS configs in parallel.
 * Replaces 3 wrapper functions (~200 lines of internal API boilerplate).
 */
export const getServerSideProps: GetServerSideProps = withMultipleWrapper(
  withMasterData,
  async (context: GetServerSidePropsContext) => {
    const supabase = createServerSupabase(context);

    const [testimonialsConfig, faqConfig, subscriptionBannerConfig] =
      await Promise.all([
        readConfig<TestimonialsConfig>(supabase, "subscription/testimonials").catch(() => null),
        readConfig<FAQConfig>(supabase, "subscription/faq").catch(() => null),
        readConfig<SubscriptionBannerConfig>(supabase, "subscription/banner").catch(() => null),
      ]);

    return {
      props: {
        testimonialsConfig: testimonialsConfig ?? {
          title: "Testimonials",
          description: "",
          button: { text: "Đăng ký ngay", link: "#" },
          testimonials: [],
        },
        faqConfig: faqConfig ?? { items: [] },
        bannerConfig: subscriptionBannerConfig ?? {
          backgroundImage: "/img-admin/bg-image-11.jpg",
          subtitle: { text: "Premium" },
          title: "Nâng cấp tài khoản Pro",
          description: "Trải nghiệm toàn bộ tính năng cao cấp",
        },
      },
    };
  }
);
