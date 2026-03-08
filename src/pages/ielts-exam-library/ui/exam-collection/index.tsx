import { Options, Splide, SplideSlide } from "@splidejs/react-splide";
import { Skeleton } from "antd";
import _ from "lodash";
import { useMemo } from "react";
import "@splidejs/react-splide/css";
import { IExamCollection } from "../../api";
import { ExamItem } from "../exam-item";
import { decode } from "html-entities";

const defaultSliderOptions: Options = {
  type: "slide",
  perPage: 4,
  perMove: 1,
  gap: "24px",
  drag: "free",
  pagination: false,
  arrows: true,
  breakpoints: {
    850: {
      perPage: 2,
      padding: {
        right: "25%",
      },
    },
    550: {
      perPage: 1,
    },
  },
};

function ExamCollection({
  loading = true,
  data,
}: {
  loading?: boolean;
  data?: IExamCollection["data"]["reading" | "listening"][number];
}) {
  const sliderOptions = useMemo(() => _.merge(defaultSliderOptions, []), []);

  return (
    <article className="space-y-6">
      <header className="flex items-center mb-[30px]">
        <h3 className="text-2xl md:text-3xl font-extrabold flex-auto">
          {data?.title ? (
            decode(data.title)
          ) : (
            <Skeleton title paragraph={false} active />
          )}
        </h3>
      </header>
      <Splide options={sliderOptions} tag="section">
        {loading || !data ? (
          Array.from({ length: sliderOptions.perPage! }).map((_, index) => (
            <SplideSlide key={index}>
              <Skeleton active key={index} />
            </SplideSlide>
          ))
        ) : (
          <>
            {data.exams.map((item, index) => (
              <SplideSlide key={index}>
                <ExamItem item={item} />
              </SplideSlide>
            ))}
          </>
        )}
      </Splide>
    </article>
  );
}

export default ExamCollection;
