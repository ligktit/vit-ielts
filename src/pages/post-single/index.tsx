import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { GET_POST_DATA } from "./api";
import { IPost } from "@/shared/types";
import { ROUTES } from "@/shared/routes";

export { PageSingle } from "./ui";

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
  singleID: string
): ReturnType<GetServerSideProps> => {
  const { client, isSignedIn } = createServerApolloClient(context);

  const {
    data: { post },
  } = await client.query<{ post: Omit<IPost, "excerpt"> }, { id: string }>({
    query: GET_POST_DATA,
    variables: {
      id: singleID,
    },
    context: {
      authRequired: isSignedIn,
    },
  });

  if (!post) {
    return {
      notFound: true,
    };
  }

  if (!post.hasAccess) {
    return {
      redirect: {
        destination: ROUTES.HOME,
        permanent: false,
      },
    };
  }

  return {
    props: {
      post,
    },
  };
};
