// === Widget: Practice History ===
// Figma: white card, rounded-[20px], DS Tabs nav (Reading / Listening), antd Table content
// Tabs use DS Tabs molecule — green underline active state, Inter font
import { useState } from "react";
import { QuizListing } from "./ui";
import { Tabs } from "@/shared/ui/ds/molecules/tabs";
import type { TabItem } from "@/shared/ui/ds/molecules/tabs";

const TABS: TabItem[] = [
  { id: "reading", label: "Reading Practices" },
  { id: "listening", label: "Listening Practices" },
];

export const PracticeHistory = () => {
  const [activeKey, setActiveKey] = useState<"reading" | "listening">("reading");

  return (
    <div
      className="bg-white rounded-[20px] border border-[rgba(25,29,36,0.08)] shadow-[0px_6px_18px_0px_rgba(0,0,0,0.05)] overflow-hidden"
      data-section="practice-history"
    >
      {/* === Tab Header === */}
      <div className="border-b border-[#e5e6e8] px-5">
        <Tabs
          tabs={TABS}
          activeId={activeKey}
          onChange={(id) => setActiveKey(id as "reading" | "listening")}
          className="bg-transparent rounded-none pt-0 px-0 gap-0"
        />
      </div>

      {/* === Table Content === */}
      <div className="p-4 overflow-x-auto">
        <QuizListing skill={activeKey} />
      </div>
    </div>
  );
};
