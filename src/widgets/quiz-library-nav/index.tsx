import { ROUTES } from "@/shared/routes";
import _ from "lodash";
import Image from "next/image";
import { useRouter } from "next/router";
import { twMerge } from "tailwind-merge";

const navigationItems = [
  {
    label: "Mock Tests",
    link: ROUTES.EXAM.ARCHIVE,
    icon: (active: boolean) => (
      <Image
        src="/assets/figma/icons/book (1) 1.svg"
        alt="Mock Tests"
        width={22}
        height={22}
        className={active ? "brightness-0 invert" : "brightness-0"}
      />
    ),
  },
  {
    label: "Listening Practices",
    link: ROUTES.PRACTICE.ARCHIVE_LISTENING,
    icon: (active: boolean) => (
      <Image
        src="/assets/figma/icons/listen 1.svg"
        alt="Listening Practices"
        width={22}
        height={22}
        className={active ? "brightness-0 invert" : "brightness-0"}
      />
    ),
  },
  {
    label: "Reading Practices",
    link: ROUTES.PRACTICE.ARCHIVE_READING,
    icon: (active: boolean) => (
      <Image
        src="/assets/figma/icons/reading-book 1.svg"
        alt="Reading Practices"
        width={22}
        height={22}
        className={active ? "brightness-0 invert" : "brightness-0"}
      />
    ),
  },
  {
    label: "Speaking Samples",
    link: ROUTES.SAMPLE_ESSAY.ARCHIVE_SPEAKING,
    icon: (active: boolean) => (
      <Image
        src="/assets/figma/icons/speaking 1.svg"
        alt="Speaking Samples"
        width={22}
        height={22}
        className={active ? "brightness-0 invert" : "brightness-0"}
      />
    ),
  },
  {
    label: "Writing Samples",
    link: ROUTES.SAMPLE_ESSAY.ARCHIVE_WRITING,
    icon: (active: boolean) => (
      <Image
        src="/assets/figma/icons/copywriting (1) 1.svg"
        alt="Writing Samples"
        width={22}
        height={22}
        className={active ? "brightness-0 invert" : "brightness-0"}
      />
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
    <div className="flex items-center gap-1.5 sm:gap-2 xl:gap-4 flex-wrap">
      {navigationItems.map((item, index) => {
        const active = isActive(item.link);
        return (
          <a
            key={index}
            href={item.link}
            className="cursor-pointer w-full sm:w-auto"
          >
            <div
              className={twMerge(
                "flex items-center justify-center gap-1.5 sm:gap-2 xl:gap-4 h-[36px] sm:h-[40px] xl:h-[50px] py-[6px] sm:py-[10px] xl:py-[15px] px-[8px] sm:px-[12px] xl:px-[20px] rounded-[25px] border transition-colors whitespace-nowrap [&_img]:w-[14px] [&_img]:h-[14px] sm:[&_img]:w-[16px] sm:[&_img]:h-[16px] xl:[&_img]:w-[22px] xl:[&_img]:h-[22px]",
                active
                  ? "bg-primary-500 border-primary text-white"
                  : "bg-white border-[#191D22] text-[#191D22] hover:bg-gray-50"
              )}
            >
              {item.icon(active)}
              <p className="text-[11px] sm:text-[12px] xl:text-base font-medium">{item.label}</p>
            </div>
          </a>
        );
      })}
    </div>
  );
}

export default QuizLibraryNav;
