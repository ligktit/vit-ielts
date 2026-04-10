import Image from "next/image";
import { SampleEssayProps } from "../..";
import _ from "lodash";
import { ROUTES } from "@/shared/routes";
import { TestCard } from "@/shared/ui/ds";
import { normalizeSectionBadge } from "@/shared/lib/quiz-part";

const PART_COLORS = [
  "rgb(255, 164, 27)", // Part 1 / Task 1 / Passage 1
  "rgb(86, 95, 204)", // Part 2 / Task 2 / Passage 2
  "rgb(184, 143, 217)", // Part 3
  "rgb(100, 200, 150)", // Part 4 (for listening)
];

export const SingleItem = ({ post, skill }: { post: any; skill: string }) => {
  const getFieldInfo = () => {
    switch (skill) {
      case "speaking": {
        const speakingPart = post.speakingSampleEssayFields?.part?.[0] || "1";
        return normalizeSectionBadge("speaking", speakingPart);
      }
      case "writing": {
        const task = post.writingSampleEssayFields?.task?.[0] || "1";
        return normalizeSectionBadge("writing", task);
      }
      default:
        return { label: "", colorIndex: 1 as const };
    }
  };

  const getListItems = () => {
    switch (skill) {
      case "speaking":
        return (
          post.speakingSampleEssayFields?.questionType?.map((item: string) => item) ||
          []
        );
      case "writing":
        return post.writingSampleEssayFields?.topic?.map((item: string) => item) || [];
      default:
        return [];
    }
  };

  const { label, colorIndex } = getFieldInfo();
  const listItems = getListItems();

  // Original vertical card layout for all skills (including Writing and Speaking on home page)
  return (
    <TestCard
      image={post.featuredImage?.node?.sourceUrl || post.featured_image}
      title={post.title}
      skill={skill as 'reading' | 'listening' | 'speaking' | 'writing'}
      part={label}
      isPro={post.postMeta?.proUserOnly ?? post.pro_user_only ?? false}
      href={ROUTES.SAMPLE_ESSAY.SINGLE(post.slug)}
      isLocked={post.postMeta?.proUserOnly ?? post.pro_user_only ?? false}
    />
  );
};
