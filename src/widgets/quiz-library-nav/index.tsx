import { ROUTES } from "@/shared/routes";
import {
  IELTSListeningExamIcon,
  IELTSReadingExamIcon,
  IELTSSpeakingExamIcon,
  IELTSWritingExamIcon,
} from "@/shared/ui/icons";
import _ from "lodash";
import { useRouter } from "next/router";
import { twMerge } from "tailwind-merge";

const navigationItems = [
  {
    label: "Mock Tests",
    link: ROUTES.EXAM.ARCHIVE,
    icon: (
      <span className="material-symbols-rounded align-middle filled text-current!">
        grid_view
      </span>
    ),
  },
  {
    label: "Listening Practices",
    link: ROUTES.PRACTICE.ARCHIVE_LISTENING,
    icon: (
      <IELTSListeningExamIcon width={24} height={24} className="text-current" />
    ),
  },
  {
    label: "Reading Practices",
    link: ROUTES.PRACTICE.ARCHIVE_READING,
    icon: (
      <IELTSReadingExamIcon width={24} height={24} className="text-current" />
    ),
  },
  {
    label: "Speaking Samples",
    link: ROUTES.SAMPLE_ESSAY.ARCHIVE_SPEAKING,
    icon: (
      <IELTSSpeakingExamIcon width={24} height={24} className="text-current" />
    ),
  },
  {
    label: "Writing Samples",
    link: ROUTES.SAMPLE_ESSAY.ARCHIVE_WRITING,
    icon: (
      <IELTSWritingExamIcon width={24} height={24} className="text-current" />
    ),
  },
];

function QuizLibraryNav() {
  const router = useRouter();

  const isActive = (path: string) => {
    return (
      router.pathname === path || router.query.slug?.[0] === _.trim(path, "/")
    );
  };

  return (
    <div className="flex items-center gap-2.5 flex-wrap">
      {navigationItems.map((item, index) => (
        <a
          key={index}
          href={item.link}
          className="cursor-pointer w-full sm:w-auto"
        >
          <div
            className={twMerge(
              isActive(item.link)
                ? "text-white from-primary-400 to-primary-500 border-primary!"
                : "hover:border-primary! hover:text-white text-gray-500 hover:from-primary-400 hover:to-primary-500",
              "flex items-center space-x-2 border py-2 px-4 rounded-full border-current bg-gradient-to-b"
            )}
          >
            {item.icon}
            <p className="text-base">{item.label}</p>
          </div>
        </a>
      ))}
    </div>
  );
}

export default QuizLibraryNav;
