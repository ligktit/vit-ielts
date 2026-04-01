import { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export const ProBadge = ({ className, ...props }: ComponentProps<"span">) => {
  return (
    <span
      className={twMerge(
        "inline-flex shrink-0 select-none items-center justify-center rounded-[5px] bg-[#D94A56] font-bold leading-none text-white shadow-[0_4px_8px_3px_rgba(0,0,0,0.15),_0_1px_3px_0_rgba(0,0,0,0.30)]",
        "h-[26px] w-[46px] text-xs",
        className
      )}
      title="This test requires a PRO account"
      {...props}
    >
      PRO
    </span>
  );
};

