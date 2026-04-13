import { Container, Empty } from "@/shared/ui";
import { SEOHeader } from "@/widgets";
import { CategoryData } from "../api";
import { Pagination } from "antd";
import { HeroBanner } from "@/shared/ui/ds";
import Link from "next/link";
import { DefaultView } from "@/shared/ui/post";
import { useRouter } from "next/router";
import { decode } from "html-entities";

export const PageArchive = ({
  category,
  posts,
  paged,
  pageSize,
}: {
  category: CategoryData["category"];
  posts: CategoryData["posts"];
  paged: number;
  pageSize: number;
}) => {
  const router = useRouter();
  const dsBreadcrumbs = (category.seo?.breadcrumbs || []).map((item) => ({
    label: decode(item.text),
    href: item.url,
  }));

  return (
    <>
      <SEOHeader fullHead={category.seo?.fullHead} title={category.seo?.title} />
      <HeroBanner 
        title={category.name || "Blog"} 
        breadcrumbs={dsBreadcrumbs} 
      />
      <Container className="px-4 sm:px-6">
        <div className="flex -m-4 flex-wrap mt-2">
          <div className="p-4 w-full">
            <div className="pb-5 space-y-4">
              {posts.edges.length > 0 ? (
                <>
                  <div className="flex -m-1.5 flex-wrap items-stretch mb-4">
                    {posts.edges.map((item, index) => (
                      <div className="p-1.5 w-full md:w-1/3" key={index}>
                        <DefaultView post={item.node} />
                      </div>
                    ))}
                  </div>
                  <Pagination
                    className="justify-center"
                    defaultCurrent={paged}
                    defaultPageSize={pageSize}
                    total={posts.pageInfo.offsetPagination.total}
                    onChange={(page) => {
                      router.push(`${category.link}/page/${page}`);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  />
                </>
              ) : (
                <Empty
                  title="There is no news!"
                  subtitle="We will update as soon as possible."
                />
              )}
            </div>
          </div>
          {/* <div className="p-4 md:w-4/12 w-full">
            <div className="bg-gray-100 h-full"></div>
          </div> */}
        </div>
      </Container>
    </>
  );
};
