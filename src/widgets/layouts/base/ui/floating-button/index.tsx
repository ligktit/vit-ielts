import { useAppContext } from "@/appx/providers";
import { usePrimaryPointerQuery } from "@/shared/hooks";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

export const FloatingButton = () => {
  const {
    masterData: {
      allSettings: { generalSettingsTitle },
      websiteOptions: {
        websiteOptionsFields: {
          generalSettings: { email, facebook, zalo },
        },
      },
    },
  } = useAppContext();
  const [isHovered, setHovered] = useState(false);
  const isTouchDevice = usePrimaryPointerQuery();

  const handleHover = (boolean: boolean) => {
    if (isTouchDevice === "fine") {
      setHovered(boolean);
    }
  };

  const handleClick = () => {
    if (isTouchDevice !== "fine") {
      if (isHovered) {
        setHovered(false);
      } else {
        setHovered(true);
      }
    }
  };

  return (
    <div
      className="fixed z-50 right-3 sm:right-9 bottom-1 sm:bottom-4 translate-y-[-30px] md:translate-x-[none] md:translate-y-[none] text-white font-bold font-nunito text-base"
      onMouseEnter={() => handleHover(true)}
      onMouseLeave={() => handleHover(false)}
      onClick={handleClick}
    >
      <div
        className={twMerge(
          "w-12 h-12 absolute block left-1/2 -translate-x-1/2 bottom-0 opacity-0 translate-y-0 duration-300 after:content-[''] after:absolute after:left-0 after:bottom-0 after:translate-y-full after:w-full after:h-1/2",
          isHovered && "opacity-100 -translate-y-[11.5rem]"
        )}
      >
        <Link
          href={facebook}
          className="group relative w-12 h-12 block"
          target="_blank"
          rel="nofollow noopener noreferrer"
        >
          <div
            className={twMerge(
              "absolute left-5 -translate-x-full max-w-max duration-300 py-1 px-0 group-hover:px-3 group-hover:pr-6 pr-0 bg-[#0866ff] top-1/2 -translate-y-1/2 rounded-l-full overflow-hidden group-hover:w-[500px] w-0 line-clamp-1",
              !isTouchDevice && "w-0 p-0"
            )}
          >
            Chat với {generalSettingsTitle}
          </div>
          <Image
            fill
            alt="mail"
            src="/facebook-floating.webp"
            className="object-contain"
            unoptimized
          />
        </Link>
      </div>

      <div
        className={twMerge(
          "w-12 h-12 absolute block left-1/2 -translate-x-1/2 bottom-0 opacity-0 translate-y-0 duration-300 after:content-[''] after:absolute after:left-0 after:bottom-0 after:translate-y-full after:w-full after:h-1/2",
          isHovered && "opacity-100 -translate-y-[8rem]"
        )}
      >
        <Link
          href={`mailto:${email}`}
          className="group relative w-12 h-12 block"
          target="_blank"
          rel="nofollow noopener noreferrer"
        >
          <div
            className={twMerge(
              "absolute left-5 -translate-x-full max-w-max duration-300 py-1 px-0 group-hover:px-3 group-hover:pr-6 pr-0 bg-[#13A62E] top-1/2 -translate-y-1/2 rounded-l-full overflow-hidden group-hover:w-[500px] w-0 line-clamp-1",
              !isTouchDevice && "w-0 p-0"
            )}
          >
            Góp ý cho {generalSettingsTitle}
          </div>
          <Image
            fill
            alt="mail"
            src="/vote-floating.png"
            className="object-contain"
            unoptimized
          />
        </Link>
      </div>

      <div
        className={twMerge(
          "w-12 h-12 absolute block left-1/2 -translate-x-1/2 bottom-0 opacity-0 translate-y-0 duration-300 after:content-[''] after:absolute after:left-0 after:bottom-0 after:translate-y-full after:w-full after:h-1/2",
          isHovered && "opacity-100 -translate-y-[4.5rem]"
        )}
      >
        <Link
          href={zalo}
          className="group relative w-12 h-12 block"
          target="_blank"
          rel="nofollow noopener noreferrer"
        >
          <div
            className={twMerge(
              "absolute left-5 -translate-x-full max-w-max duration-300 py-1 px-0 group-hover:px-3 group-hover:pr-6 pr-0 bg-[#0028FB] top-1/2 -translate-y-1/2 rounded-l-full overflow-hidden group-hover:w-[500px] w-0 line-clamp-1",
              !isTouchDevice && "w-0 p-0"
            )}
          >
            Liên hệ với {generalSettingsTitle}
          </div>
          <Image
            fill
            alt="mail"
            src="/zalo-floating.png"
            sizes="100%"
            className="object-contain"
            unoptimized
          />
        </Link>
      </div>

      <button className="w-16 h-16 relative cursor-pointer block">
        <Image
          fill
          alt="floating report toggle button"
          src="/floating-report.png"
          className="object-contain"
          unoptimized
        />
      </button>
    </div>
  );
};
