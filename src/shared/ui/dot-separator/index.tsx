import { twMerge } from "tailwind-merge";

export const DotSeparator = ({ className }: { className?: string }) => {
  return (
    <div
      className={twMerge(
        "flex items-center gap-x-5 justify-center my-8",
        className
      )}
    >
      {Array.from({ length: 3 }, (_, index) => (
        <span key={index} className="w-1 h-1 rounded-full bg-gray-400" />
      ))}
    </div>
  );
};
