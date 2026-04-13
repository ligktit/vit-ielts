import { BlankLayout } from "@/widgets/layouts";
import { IPracticeSingle, ITestResult } from "../api";
import ReviewExplanation from "../ui/review-explanation";
import { ROUTES } from "@/shared/routes";
import Link from "next/link";

export function PageTestResultExplanation({
  post,
  testResult,
}: {
  post: IPracticeSingle;
  testResult: ITestResult;
}) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Mini header */}
      <header className="flex items-center gap-4 px-4 h-16 bg-white shrink-0 z-10 border-none shadow">
        <Link
          href={ROUTES.TEST_RESULT(testResult.id)}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600"
        >
          <span className="material-symbols-rounded text-[20px]">arrow_back</span>
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 leading-none mb-0.5">Giải thích đáp án</p>
          <h1 className="text-sm font-semibold text-[#191d24] truncate">{post.title}</h1>
        </div>
      </header>

      {/* Explanation fullscreen */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ReviewExplanation quiz={post} testResult={testResult} fullPage />
      </div>
    </div>
  );
}

PageTestResultExplanation.Layout = BlankLayout;
