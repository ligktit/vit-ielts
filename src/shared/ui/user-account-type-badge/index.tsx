import { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export const UserAccountTypeBadge = ({
  isPro,
  ...props
}: ComponentProps<"span"> & { isPro?: boolean }) => {
  const { className, ...rest } = props;
  return (
    <span
      aria-hidden
      className={twMerge(
        "uppercase text-sm bg-primary text-white px-2 py-0.5 rounded",
        !isPro && "bg-gray-400",
        className
      )}
      {...rest}
    >
      {isPro ? "pro" : "free"}
    </span>
  );
};
