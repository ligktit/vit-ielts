import {
  IELTSListeningExamIcon,
  IELTSReadingExamIcon,
} from "@/shared/ui/icons";
import { Card, Tabs } from "antd";
import { useState } from "react";
import { QuizListing } from "./ui";

export const PracticeHistory = () => {
  const [activeKey, setActiveKey] = useState<string>("reading");

  const navigationItems = [
    {
      key: "reading",
      label: "Reading Practices",
      icon: (
        <IELTSReadingExamIcon
          width={16}
          height={16}
          className="inline-flex -mt-[0.25em]"
        />
      ),
    },
    {
      key: "listening",
      label: "Listening Practices",
      icon: (
        <IELTSListeningExamIcon
          width={16}
          height={16}
          className="inline-flex -mt-[0.25em]"
        />
      ),
    },
  ];

  return (
    <Card>
      <Tabs
        activeKey={activeKey}
        onChange={setActiveKey}
        defaultActiveKey="reading"
        size="large"
        items={navigationItems}
      />
      <QuizListing skill={activeKey as "listening" | "reading"} />
    </Card>
  );
};
