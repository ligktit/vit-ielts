import Link from "next/link";
import { Options, Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";
import { Empty, Skeleton } from "antd";
import _ from "lodash";
import { useMemo } from "react";
import { GET_EXAM_COLLECTIONS, IExamCollectionResponse } from "@/pages/ielts-exam-library/api";
import { ExamItem } from "@/pages/ielts-exam-library/ui/exam-item";
import { ROUTES } from "@/shared/routes";
import { useQuery } from "@/shared/graphql/compat";

type Props = {
  title: string;
  view_more?: false | string;
  view_more_link?: string;
  limit?: number;
  sliderOptions?: Options;
};

const defaultSliderOptions: Options = {
  type: "slide",
  perPage: 4,
  perMove: 2,
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

export const FullTestCarousel = ({
  title,
  view_more = "View more",
  view_more_link = ROUTES.EXAM.ARCHIVE,
  limit = 20,
  sliderOptions: inputSliderOptions = {},
}: Props) => {
  const sliderOptions = useMemo(
    () => _.merge({}, defaultSliderOptions, inputSliderOptions),
    [inputSliderOptions]
  );
  const { data, loading } = useQuery<IExamCollectionResponse>(
    GET_EXAM_COLLECTIONS,
    {
      context: { authRequired: false },
      variables: {
        offsetPagination: {
          offset: 0,
          size: limit,
        },
      },
    }
  );

  const exams = useMemo(() => {
    if (!data) return [];
    const listening = data.examCollection.data.listening.flatMap(
      (collection) => collection.exams
    );
    const reading = data.examCollection.data.reading.flatMap(
      (collection) => collection.exams
    );
    return [...listening, ...reading];
  }, [data]);

  return (
    <article className="space-y-6">
      <header className="flex items-center mb-[30px]">
        <h3 className="text-2xl md:text-3xl font-extrabold flex-auto">
          {title}
        </h3>
        {view_more && (
          <Link
            href={view_more_link}
            title={view_more}
            className="flex items-center group text-[15px] capitalize"
          >
            <span className="font-bold mr-2.5 group-hover:underline hidden md:block">
              {view_more}
            </span>
            <span className="material-symbols-rounded hidden! md:block!">
              chevron_right
            </span>
            <div className="md:hidden p-2 bg-gray-200 rounded-full">
              <span className="material-symbols-rounded block!">
                arrow_forward
              </span>
            </div>
          </Link>
        )}
      </header>
      {loading ? (
        <Splide options={sliderOptions} tag="section">
          {Array.from({ length: sliderOptions.perPage! }).map((_, index) => (
            <SplideSlide key={index}>
              <Skeleton active key={index} />
            </SplideSlide>
          ))}
        </Splide>
      ) : (
        <>
          {exams.length ? (
            <Splide options={sliderOptions} tag="section">
              {exams.map((item) => (
                <SplideSlide key={item.id}>
                  <ExamItem item={item} />
                </SplideSlide>
              ))}
            </Splide>
          ) : (
            <Empty />
          )}
        </>
      )}
    </article>
  );
};
