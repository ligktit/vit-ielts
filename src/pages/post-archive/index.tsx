import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { CategoryData, GET_NEWS_ARCHIVE_DATA } from "./api";

export { PageArchive } from "./ui";

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
  categoryID: string
): ReturnType<GetServerSideProps> => {
  const pageSize = 12;
  const paged =
    context.query.slug?.at(-2) === "page" ? context.query.slug.at(-1) : 1;

  const { client } = createServerApolloClient(context);

  console.log({
    id: categoryID,
    size: pageSize,
    offset: (Number(paged) - 1) * pageSize,
    categoryIn: [categoryID],
  });

  const {
    data: { category, posts },
  } = await client.query<
    CategoryData,
    { id: string; size?: number; offset?: number; categoryIn: string[] }
  >({
    query: GET_NEWS_ARCHIVE_DATA,
    variables: {
      id: categoryID,
      size: pageSize,
      offset: (Number(paged) - 1) * pageSize,
      categoryIn: [categoryID],
    },
    context: {
      authRequired: true,
    },
  });

  return {
    props: {
      category,
      posts,
      paged: Number(paged),
      pageSize,
    },
  };
};
