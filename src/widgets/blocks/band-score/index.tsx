// .../widgets/blocks/band-score/ui/bandscore.tsx

import { useAppContext } from "@/appx/providers";
import { Tabs } from "antd";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useEffect } from "react";

// Định nghĩa kiểu dữ liệu cho một Band
interface BandScoreItem {
  score: number;
  correct_answers: string;
  skill_level: string;
  description: string;
}

// Thang điểm IELTS Listening
const LISTENING_BANDS: BandScoreItem[] = [
  {
    score: 9.0,
    correct_answers: "39-40",
    skill_level: "Expert user",
    description:
      "You have a full operational command of the language. Your use of English is appropriate, accurate and fluent, and you show complete understanding.",
  },
  {
    score: 8.5,
    correct_answers: "37-38",
    skill_level: "Very good user",
    description:
      "You have a fully operational command of the language with only occasional unsystematic inaccuracies and inappropriate usage. You may misunderstand some things in unfamiliar situations. You handle complex detailed argumentation well.",
  },
  {
    score: 8.0,
    correct_answers: "35-36",
    skill_level: "Very good user",
    description:
      "You have a fully operational command of the language with only occasional unsystematic inaccuracies and inappropriate usage. You may misunderstand some things in unfamiliar situations. You handle complex detailed argumentation well.",
  },
  {
    score: 7.5,
    correct_answers: "33-34",
    skill_level: "Good user",
    description:
      "You have an operational command of the language, though with occasional inaccuracies, inappropriate usage and misunderstandings in some situations. Generally you handle complex language well and understand detailed reasoning.",
  },
  {
    score: 7.0,
    correct_answers: "30-32",
    skill_level: "Good user",
    description:
      "You have an operational command of the language, though with occasional inaccuracies, inappropriate usage and misunderstandings in some situations. Generally you handle complex language well and understand detailed reasoning.",
  },
  {
    score: 6.5,
    correct_answers: "27-29",
    skill_level: "Competent user",
    description:
      "Generally you have an effective command of the language despite some inaccuracies, inappropriate usage and misunderstandings. You can use and understand fairly complex language, particularly in familiar situations.",
  },
  {
    score: 6.0,
    correct_answers: "23-26",
    skill_level: "Competent user",
    description:
      "Generally you have an effective command of the language despite some inaccuracies, inappropriate usage and misunderstandings. You can use and understand fairly complex language, particularly in familiar situations.",
  },
  {
    score: 5.5,
    correct_answers: "20-22",
    skill_level: "Modest user",
    description:
      "You have a partial command of the language, and cope with overall meaning in most situations, although you are likely to make many mistakes. You should be able to handle basic communication in your own field.",
  },
  {
    score: 5.0,
    correct_answers: "16-19",
    skill_level: "Modest user",
    description:
      "You have a partial command of the language, and cope with overall meaning in most situations, although you are likely to make many mistakes. You should be able to handle basic communication in your own field.",
  },
  {
    score: 4.5,
    correct_answers: "13-15",
    skill_level: "Limited user",
    description:
      "Your basic competence is limited to familiar situations. You frequently show problems in understanding and expression. You are not able to use complex language.",
  },
  {
    score: 4.0,
    correct_answers: "10-12",
    skill_level: "Limited user",
    description:
      "Your basic competence is limited to familiar situations. You frequently show problems in understanding and expression. You are not able to use complex language.",
  },
  {
    score: 3.5,
    correct_answers: "7-9",
    skill_level: "Extremely limited user",
    description:
      "You convey and understand only general meaning in very familiar situations. There are frequent breakdowns in communication.",
  },
  {
    score: 3.0,
    correct_answers: "5-6",
    skill_level: "Extremely limited user",
    description:
      "You convey and understand only general meaning in very familiar situations. There are frequent breakdowns in communication.",
  },
  {
    score: 2.5,
    correct_answers: "3-4",
    skill_level: "Intermittent user",
    description: "No real communication is possible.",
  },
  // Bổ sung các band thấp hơn nếu cần thiết cho đủ 0-40, nhưng dựa trên bảng thì band thấp nhất là 2.5
];

// Thang điểm IELTS Reading (General) (dựa trên ảnh)
const READING_GENERAL_BANDS: BandScoreItem[] = [
  {
    score: 9.0,
    correct_answers: "40",
    skill_level: "Expert user",
    description:
      "You have a full operational command of the language. Your use of English is appropriate, accurate and fluent, and you show complete understanding.",
  },
  {
    score: 8.5,
    correct_answers: "39",
    skill_level: "Very good user",
    description:
      "You have a fully operational command of the language with only occasional unsystematic inaccuracies and inappropriate usage. You may misunderstand some things in unfamiliar situations. You handle complex detailed argumentation well.",
  },
  {
    score: 8.0,
    correct_answers: "38-37",
    skill_level: "Very good user",
    description:
      "You have a fully operational command of the language with only occasional unsystematic inaccuracies and inappropriate usage. You may misunderstand some things in unfamiliar situations. You handle complex detailed argumentation well.",
  },
  {
    score: 7.5,
    correct_answers: "36",
    skill_level: "Good user",
    description:
      "You have an operational command of the language, though with occasional inaccuracies, inappropriate usage and misunderstandings in some situations. Generally you handle complex language well and understand detailed reasoning.",
  },
  {
    score: 7.0,
    correct_answers: "35-34",
    skill_level: "Good user",
    description:
      "You have an operational command of the language, though with occasional inaccuracies, inappropriate usage and misunderstandings in some situations. Generally you handle complex language well and understand detailed reasoning.",
  },
  {
    score: 6.5,
    correct_answers: "33-32",
    skill_level: "Competent user",
    description:
      "Generally you have an effective command of the language despite some inaccuracies, inappropriate usage and misunderstandings. You can use and understand fairly complex language, particularly in familiar situations.",
  },
  {
    score: 6.0,
    correct_answers: "31-30",
    skill_level: "Competent user",
    description:
      "Generally you have an effective command of the language despite some inaccuracies, inappropriate usage and misunderstandings. You can use and understand fairly complex language, particularly in familiar situations.",
  },
  {
    score: 5.5,
    correct_answers: "29-27",
    skill_level: "Modest user",
    description:
      "You have a partial command of the language, and cope with overall meaning in most situations, although you are likely to make many mistakes. You should be able to handle basic communication in your own field.",
  },
  {
    score: 5.0,
    correct_answers: "26-23",
    skill_level: "Modest user",
    description:
      "You have a partial command of the language, and cope with overall meaning in most situations, although you are likely to make many mistakes. You should be able to handle basic communication in your own field.",
  },
  {
    score: 4.5,
    correct_answers: "22-19",
    skill_level: "Limited user",
    description:
      "Your basic competence is limited to familiar situations. You frequently show problems in understanding and expression. You are not able to use complex language.",
  },
  {
    score: 4.0,
    correct_answers: "18-15",
    skill_level: "Limited user",
    description:
      "Your basic competence is limited to familiar situations. You frequently show problems in understanding and expression. You are not able to use complex language.",
  },
  {
    score: 3.5,
    correct_answers: "14-12",
    skill_level: "Extremely limited user",
    description:
      "You convey and understand only general meaning in very familiar situations. There are frequent breakdowns in communication.",
  },
  {
    score: 3.0,
    correct_answers: "11-9",
    skill_level: "Extremely limited user",
    description:
      "You convey and understand only general meaning in very familiar situations. There are frequent breakdowns in communication.",
  },
  {
    score: 2.5,
    correct_answers: "6-8",
    skill_level: "Intermittent user",
    description: "No real communication is possible.",
  },
  // Bổ sung các band thấp hơn nếu cần thiết cho đủ 0-40, nhưng dựa trên bảng thì band thấp nhất là 2.5
];

type ModuleType = "listening" | "reading_general";

// [CẬP NHẬT] Hàm helper để tìm band từ số câu đúng
const getBandFromCorrectAnswers = (
  count: number,
  bands: BandScoreItem[]
): BandScoreItem => {
  if (typeof count !== "number") return bands[bands.length - 1]; // Trả về band thấp nhất

  for (const band of bands) {
    const range = band.correct_answers.split("-");

    if (range.length === 1) {
      // Trường hợp là một số ("40", "39", "36")
      if (count === parseInt(range[0], 10)) {
        return band;
      }
    } else if (range.length === 2) {
      // Trường hợp là một khoảng ("37-38", "3-4")
      const min = parseInt(range[0], 10);
      const max = parseInt(range[1], 10);
      if (count >= min && count <= max) {
        return band;
      }
    }
  }

  // Mặc định trả về band thấp nhất nếu không tìm thấy
  return bands[bands.length - 1];
};

// [CẬP NHẬT] Nhận props mới: correctAnswersCount, onScoreCalculated và moduleType
export function BandScore({
  correctAnswersCount,
  onScoreCalculated,
  moduleType = "listening", // [MẶC ĐỊNH] Mặc định là Listening
}: {
  correctAnswersCount: number;
  onScoreCalculated: (score: number) => void;
  moduleType?: ModuleType; // Thêm prop để chọn thang điểm
}) {
  const {
    masterData: {
      websiteOptions: {
        websiteOptionsFields: {
          generalSettings: { bannerTestResult },
        },
      },
    },
  } = useAppContext();

  // [MỚI] Chọn mảng band dựa trên moduleType
  const currentBands = useMemo(() => {
    return moduleType === "listening" ? LISTENING_BANDS : READING_GENERAL_BANDS;
  }, [moduleType]);

  // [ĐÃ SỬA] Tìm band và key dựa trên số câu đúng và currentBands
  const activeBand = useMemo(
    () => getBandFromCorrectAnswers(correctAnswersCount, currentBands),
    [correctAnswersCount, currentBands]
  );

  const activeKey = useMemo(() => {
    if (!activeBand) return "0"; // Mặc định
    const index = currentBands.findIndex((b) => b.score === activeBand.score);
    // Trả về index dưới dạng string
    return index !== -1 ? index.toString() : "0";
  }, [activeBand, currentBands]);

  // [ĐÃ SỬA] Gửi điểm đã tìm được ngược lên component cha (index.tsx)
  useEffect(() => {
    if (activeBand) {
      onScoreCalculated(activeBand.score);
    }
  }, [activeBand, onScoreCalculated]);

  return (
    <div className="space-y-2">
      <h3 className="flex items-center text-lg sm:text-2xl font-semibold text-primary space-x-2">
        <span className="material-symbols-rounded sm:text-4xl!">
          social_leaderboard
        </span>
        <span>Band Score:</span>
      </h3>
      <Tabs
        activeKey={activeKey}
        items={currentBands.map((item, idx) => {
          // [ĐÃ SỬA] Dùng currentBands
          return {
            key: idx.toString(),
            label: (
              <span className="px-2 font-extrabold font-nunito">
                {item.score}
              </span>
            ),
            children: (
              <div className="divide-y divide-gray-300">
                <p className="py-1">
                  Correct Answers:{" "}
                  <span className="font-extrabold font-nunito text-primary">
                    {item.correct_answers}
                  </span>
                </p>
                <p className="py-1">
                  Skill Level:{" "}
                  <span className="font-extrabold font-nunito text-primary">
                    {item.skill_level}
                  </span>
                </p>
                <p className="py-1">
                  Description:{" "}
                  <span className="font-extrabold font-nunito text-primary">
                    {item.description}
                  </span>
                </p>
              </div>
            ),
          };
        })}
      />
      <Link href="#">
        <div className="aspect-[700/90] relative">
          <Image
            className="object-cover"
            src={
              bannerTestResult?.node.sourceUrl || "https://placehold.co/700x90"
            }
            alt="banner"
            fill
            unoptimized
          />
        </div>
      </Link>
    </div>
  );
}
