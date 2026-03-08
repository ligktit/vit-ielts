import { Card } from "antd";
import { WidgetContextProvider } from "./context";
import { DetailScore, ExamDate } from "./ui";
import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

export const TargetScore = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [componentWidth, setComponentWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setComponentWidth(containerRef.current?.offsetWidth || 0);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [containerRef]);

  return (
    <WidgetContextProvider>
      <div className="flex flex-wrap -m-2" ref={containerRef}>
        <div
          className={twMerge(
            "p-2",
            componentWidth >= 1170 ? "w-full md:w-1/2" : "w-full"
          )}
        >
          <Card classNames={{ body: "p-0" }}>
            <DetailScore />
          </Card>
        </div>
        <div
          className={twMerge(
            "p-2",
            componentWidth >= 1170 ? "w-full md:w-1/2" : "w-full"
          )}
        >
          <Card classNames={{ body: "p-0" }}>
            <ExamDate />
          </Card>
        </div>
      </div>
    </WidgetContextProvider>
  );
};
