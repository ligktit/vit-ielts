import { IPost } from "@/shared/types";
import _ from "lodash";
import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "antd";
import { GET_RELATED_POSTS } from "@/pages/post-single/api";
import { ProLink } from "@/shared/ui";
import { useQuery } from "@/shared/graphql/compat";

function RelatedPost({ post }: { post: IPost }) {
  const { data, loading } = useQuery<
    { posts: { nodes: IPost[] } },
    { categoryIds: string[]; notIn: string[] }
  >(GET_RELATED_POSTS, {
    variables: {
      categoryIds: post.categories.edges.map((category) => category.node.id),
      notIn: [post.id],
    },
  });

  return (
    <>
      <h3 className="text-lg md:text-xl font-bold text-red-800 pb-2.5 mb-2.5 border-b border-gray-200">
        Related Post
      </h3>
      <div>
        {!loading ? (
          data?.posts.nodes.length ? (
            _.chunk(data?.posts.nodes, 2).map((chunk, index) => (
              <div
                key={index}
                className="flex flex-wrap -mx-2 items-stretch last:border-none last:-mb-2 border-b border-gray-200"
              >
                {chunk.map((post, index) => (
                  <div
                    key={index}
                    className="w-full md:w-1/2 p-2 odd:border-b border-gray-200 md:border-none"
                  >
                    <article className="flex items-start gap-x-2 h-full">
                      <ProLink
                        isPro={post.postMeta.proUserOnly}
                        href={post.link}
                        title={post.title}
                        className="rounded-lg overflow-hidden block w-1/3 md:w-1/5 self-stretch"
                      >
                        <div className="relative aspect-[4/3] md:aspect-square max-w-full min-h-full">
                          <Image
                            src={
                              post.featuredImage?.node.sourceUrl ||
                              "https://placehold.co/600x400"
                            }
                            alt={post.featuredImage?.node.altText || post.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      </ProLink>
                      <div className="space-y-1 md:space-y-1.5 flex-auto w-2/3 md:w-4/5">
                        <Link
                          href={post.link}
                          className="block w-fit"
                          title={post.title}
                        >
                          <h3 className="text-sm font-semibold text-red-800 hover:text-red-800/80 line-clamp-2">
                            {post.title}
                          </h3>
                        </Link>
                        {post.categories.edges.length > 0 && (
                          <div className="items-center text-xs font-nunito flex-wrap gap-x-1 gap-y-1 flex mt-3">
                            <span className="material-symbols-rounded filled text-neutral-300 text-base! leading-none!">
                              shoppingmode
                            </span>
                            <Link
                              href={post.categories.edges[0].node.link}
                              className="block rounded-full font-extrabold text-gray-500 hover:text-red-800 duration-150"
                            >
                              <span className="block">
                                {post.categories.edges[0].node.name}
                              </span>
                            </Link>
                            <p className="text-xs text-gray-600 flex items-center space-x-1 ml-auto">
                              <span className="material-symbols-rounded text-lg! leading-none!">
                                visibility
                              </span>
                              <span>{post.postMeta.views || 0}</span>
                            </p>
                          </div>
                        )}
                      </div>
                    </article>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-600">No related post found</p>
          )
        ) : (
          <Skeleton active />
        )}
      </div>
    </>
  );
}

export default RelatedPost;
