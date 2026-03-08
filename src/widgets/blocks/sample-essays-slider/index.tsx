import Link from "next/link";
import { Options, Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";
import { Skeleton } from "antd";
import _ from "lodash";
import { useMemo } from "react";
import {
  GET_SAMPLE_ESSAY_VARIABLES,
  GET_SAMPLE_ESSAYS,
  SampleEssayResponse,
} from "./api";
import { DefaultView } from "@/pages/sample-essay/ui/archive/single-item";
import { useQuery } from "@/shared/graphql/compat";

type Props = {
  title: string;
  view_more?: false | string;
  skill?: "speaking" | "writing";
  limit?: number;
  sliderOptions?: Options;
  view_more_link?: string;
};

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

export const SampleEssaysSlider = ({
  title,
  view_more = "View more",
  view_more_link = "#",
  skill = "speaking",
  limit = 4,
  sliderOptions: inputSliderOptions = {},
}: Props) => {
  const sliderOptions = useMemo(
    () => _.merge(defaultSliderOptions, inputSliderOptions),
    [inputSliderOptions]
  );
  const { data, loading } = useQuery<
    SampleEssayResponse,
    GET_SAMPLE_ESSAY_VARIABLES
  >(GET_SAMPLE_ESSAYS, {
    variables: {
      skill,
      offsetPagination: {
        offset: 0,
        size: limit,
      },
    },
  });

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
      <Splide options={sliderOptions} tag="section">
        {loading ? (
          Array.from({ length: sliderOptions.perPage! }).map((_, index) => (
            <SplideSlide key={index}>
              <Skeleton active key={index} />
            </SplideSlide>
          ))
        ) : (
          <>
            {data ? (
              data.sampleEssayType.sampleEssays.edges.map((item, index) => (
                <SplideSlide key={index}>
                  <div className="p-0.5 h-full">
                    <DefaultView post={item} skill={skill} />
                  </div>
                </SplideSlide>
              ))
            ) : (
              <>{""}</>
            )}
          </>
        )}
      </Splide>
    </article>
  );
};
