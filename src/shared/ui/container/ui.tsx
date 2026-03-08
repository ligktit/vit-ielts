import { twMerge } from "tailwind-merge";

export const Container = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={twMerge(
        "mx-auto px-[15px] sm:px-[30px] md:px-[15px] max-w-[1360px] py-5",
        className
      )}
    >
      {children}
    </div>
  );
};
