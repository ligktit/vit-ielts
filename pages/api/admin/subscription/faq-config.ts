import type { NextApiRequest, NextApiResponse } from "next";
import { readConfig } from "~services/cms-config";
import { supabaseAdmin } from "~supabase/admin";
import type { FAQConfig } from "@/shared/types/admin-config";

/**
 * API route để đọc FAQ config
 * Chỉ dùng trong getServerSideProps
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FAQConfig | { error: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const config = await readConfig<FAQConfig>(supabaseAdmin, "subscription/faq");
    // Validate config có đầy đủ properties
    if (!config || !config.badge || !config.title) {
      throw new Error("Invalid config structure");
    }
    return res.status(200).json(config);
  } catch {
    // Trả về config mặc định nếu file không tồn tại
    const defaultConfig: FAQConfig = {
      badge: {
        text: "FREQUENTLY ASKED QUESTIONS",
      },
      title: "Have a Question with Histudy University?",
      description:
        "Its an educational platform Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
      items: [
        {
          question: "What is Histudy ? How does it work?",
          answer:
            "Histudy is an educational platform designed to help students learn and grow. It works by providing comprehensive learning materials, interactive courses, and personalized learning paths to help you achieve your educational goals.",
        },
        {
          question: "How can I get the customer support?",
          answer:
            "You can reach our customer support team through multiple channels including email, live chat, or phone. Our support team is available 24/7 to assist you with any questions or concerns you may have.",
        },
        {
          question:
            "Can I get update regularly and For how long do I get updates?",
          answer:
            "Yes, you will receive regular updates about new courses, features, and educational content. Updates are provided for the duration of your subscription period, ensuring you always have access to the latest materials and improvements.",
        },
        {
          question: "15 Things To Know About Education?",
          answer:
            "Education is a lifelong journey that involves continuous learning, critical thinking, and personal growth. It encompasses various forms of learning including formal education, self-study, and practical experience. Understanding key educational principles can help you make the most of your learning experience.",
        },
      ],
    };
    return res.status(200).json(defaultConfig);
  }
}

