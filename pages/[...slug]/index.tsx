import { withMasterData, withMultipleWrapper } from "@/shared/hoc";
import { GetServerSideProps } from "next";
import {
  getServerSideProps as getServerSidePropsArchive,
  PageArchive,
} from "@/pages/post-archive";
import {
  getServerSideProps as getServerSidePropsSingle,
  PageSingle,
} from "@/pages/post-single";
import { ComponentProps } from "react";
import {
  getServerSidePropsArchive as getServerSidePropsSampleEssayArchive,
  PageArchive as PageSampleEssayArchive,
  PageSingle as PageSampleEssaySingle,
  getServerSidePropsSingle as getServerSidePropsSampleEssaySingle,
} from "@/pages/sample-essay";

const PageHandler = (props: {
  category?: unknown;
  sampleEssays?: unknown;
  post?: unknown;
  sampleEssay?: unknown;
}) => {
  return (
    <>
      {props.category && (
        <PageArchive {...(props as ComponentProps<typeof PageArchive>)} />
      )}
      {props.post && (
        <PageSingle {...(props as ComponentProps<typeof PageSingle>)} />
      )}
      {props.sampleEssay && (
        <PageSampleEssaySingle
          {...(props as ComponentProps<typeof PageSampleEssaySingle>)}
        />
      )}
      {props.sampleEssays && (
        <PageSampleEssayArchive
          {...(props as ComponentProps<typeof PageSampleEssayArchive>)}
        />
      )}
    </>
  );
};

export default PageHandler;

const GET_NEWS_ARCHIVE_BY_SLUG = "";

export const getServerSideProps: GetServerSideProps = withMultipleWrapper(
  withMasterData,
  async (context) => {
    const slug =
      context.query.slug?.at(-2) === "page"
        ? context.query.slug?.at(-3)
        : context.query.slug?.at(-1);

    if (!slug) {
      return {
        redirect: {
          destination: "/",
          statusCode: 302,
        },
      };
    }

    if (slug === "ielts-speaking-sample") {
      return getServerSidePropsSampleEssayArchive(context, "speaking");
    } else if (slug === "ielts-writing-sample") {
      return getServerSidePropsSampleEssayArchive(context, "writing");
    }

    const { client } = createServerApolloClient(context);

    const { data } = await client.query<
      {
        category?: { id: string };
        post?: { id: string };
        sampleEssay?: { id: string };
      },
      { slug: string }
    >({
      query: GET_NEWS_ARCHIVE_BY_SLUG,
      variables: {
        slug: slug,
      },
    });

    if (data.category) {
      return getServerSidePropsArchive(context, data.category.id);
    } else if (data.post) {
      return getServerSidePropsSingle(context, data.post.id);
    } else if (data.sampleEssay) {
      return getServerSidePropsSampleEssaySingle(context, data.sampleEssay.id);
    }

    return {
      notFound: true,
    };
  }
);
