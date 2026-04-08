import { MouseEvent, useMemo } from "react";
import { useAuth } from "@/appx/providers";
import { IPracticeTest, useLatestTestScore } from "@/entities/practice-test";
import { ROUTES } from "@/shared/routes";
import { useProContentModal } from "@/shared/ui/pro-content";
import { TestCardWithScore } from "@/entities/practice-test";
import { normalizeSectionBadge } from "@/shared/lib/quiz-part";

type PracticeCardProps = {
  item: IPracticeTest;
  priority?: boolean;
};


export const PracticeCard = ({ item, priority = false }: PracticeCardProps) => {
  const openProContentModal = useProContentModal((state) => state.open);
  const { currentUser } = useAuth();

  const skill = item.quizFields.skill[0] === "listening" ? "listening" : "reading";
  const partMeta = useMemo(() => {
    return normalizeSectionBadge(skill, item.quizFields.part);
  }, [item.quizFields.part, skill]);

  const requiresUpgrade = item.quizFields.proUserOnly && !currentUser?.userData.isPro;
  // detailHref: trang giới thiệu/detail bài luyện tập
  const detailHref = ROUTES.PRACTICE.SINGLE(item.slug);

  const handleProtectedAction = (event?: MouseEvent<any>) => {
    if (!requiresUpgrade) return;
    event?.preventDefault();
    if (!currentUser) {
      window.location.href = ROUTES.LOGIN(detailHref);
      return;
    }
    openProContentModal();
  };

  return (
    <TestCardWithScore
      quizId={item.id}
      image={item.featuredImage?.node.sourceUrl}
      title={item.title}
      skill={skill}
      part={partMeta.label}
      attempts={item.quizFields.testsTaken || 0}
      isPro={item.quizFields.proUserOnly}
      isLocked={requiresUpgrade}
      // Card luôn link đến trang detail — từ đó user mới nhấn "Start Practice"
      href={requiresUpgrade ? undefined : detailHref}
      onClick={requiresUpgrade ? handleProtectedAction : undefined}
    />
  );
};
