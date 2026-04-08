import { useState } from "react";
import { TestCard, TestCardProps } from "@/shared/ui/ds/molecules/test-card/test-card";
import { useLatestTestScore } from "../hooks/useLatestTestScore";
import { TestHistoryModal } from "./test-history-modal";

export type TestCardWithScoreProps = TestCardProps & {
  quizId: string;
};

export const TestCardWithScore = ({ quizId, title, score, ...props }: TestCardWithScoreProps) => {
  const { score: latestScore } = useLatestTestScore(quizId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <>
      <TestCard 
        {...props} 
        title={title}
        score={latestScore} 
        onScoreClick={() => setIsModalOpen(true)}
      />
      <TestHistoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        quizId={quizId}
        title={title}
      />
    </>
  );
};
