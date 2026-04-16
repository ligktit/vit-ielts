import { BlankLayout } from "@/widgets/layouts";
import { IPracticeSingle, ITestResult } from "../api";
import ReviewExplanation from "../ui/review-explanation";

export function PageTestResultExplanation({
  post,
  testResult,
}: {
  post: IPracticeSingle;
  testResult: ITestResult;
}) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <ReviewExplanation quiz={post} testResult={testResult} fullPage />
    </div>
  );
}

PageTestResultExplanation.Layout = BlankLayout;
