import { Container } from "@/shared/ui";
import { SEOHeader } from "@/widgets";
import { Card } from "antd";
import { Breadcrumb, Avatar } from "@/shared/ui/ds";
import Link from "next/link";
import Image from "next/image";
import dayjs from "dayjs";
import { useCallback, useEffect } from "react";
import SharePost from "./share-post";
import { SingleSampleEssay } from "@/pages/sample-essay/api";
import { decode } from "html-entities";
import { createClient } from "~supabase/client";
import { resolveContentImage, useContentImageFallback } from "@/shared/lib/content-image";

export const PageSingle = ({
  sampleEssay: post,
}: {
  sampleEssay: SingleSampleEssay;
}) => {
  const fallbackImage = useContentImageFallback();
  // Increment view count via Supabase
  const incrementViews = useCallback(async () => {
    try {
      const supabase = createClient();
      await supabase.rpc("increment_sample_essay_views", { essay_id: post.id });
    } catch (err) {
      console.warn("Failed to increment views:", err);
    }
  }, [post.id]);

  const breadcrumbs = post.seo?.breadcrumbs || [];
  const breadcrumbItems = breadcrumbs.map((item: any) => ({
    label: decode(item.text),
    href: item.url,
  }));

  const readingTime = Math.ceil(post.content.length / 200);

  useEffect(() => {
    const thirtyPercentOfReadTime = readingTime * 0.3;
    const timeout = setTimeout(async () => {
      await incrementViews();
    }, thirtyPercentOfReadTime * 1000);

    return () => clearTimeout(timeout);
  }, [post.id, readingTime, incrementViews]);

  return (
    <>
      <SEOHeader fullHead={post.seo?.fullHead} title={post.seo?.title} />
      <div className="min-h-screen pb-20 bg-white relative">
        <div className="absolute inset-x-0 top-0 h-[380px] md:h-[420px] pointer-events-none z-0" style={{ backgroundImage: "linear-gradient(rgba(217,74,86,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(217,74,86,0.07) 1px, transparent 1px)", backgroundSize: "40px 40px", backgroundPosition: "center top" }} />
        <div className="absolute top-[380px] md:top-[420px] left-0 w-full h-[10px] bg-[#D94A56] z-0" />
        <Container className="relative z-10 pt-[160px] md:pt-[220px] mb-8">
          <div className="bg-white rounded-[24px] border border-[rgba(0,0,0,0.06)] px-[20px] md:px-[61px] py-[30px] md:py-[50px] max-w-[900px] mx-auto shadow-[0_4px_24px_rgba(0,0,0,0.04)] text-left">
            <div className="mb-[23px]"><Breadcrumb items={breadcrumbItems} /></div>
            <h1 className="text-3xl md:text-[40px] font-extrabold text-[#2D3142] font-noto-sans leading-tight mb-[23px]">{post.title}</h1>
            <div className="flex items-center justify-between pt-[23px]">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <Avatar src={post.author?.node?.userData?.avatar?.node?.sourceUrl} fallback={post.author?.node?.name?.charAt(0) || "A"} size="sm" />
                  <span className="text-sm font-medium text-[#2D3142]">{post.author?.node?.name || "Administrator"}</span>
                </div>
                <div className="text-sm font-medium text-[#6A7282]">{post.date ? new Date(post.date).toLocaleDateString("vi-VN") : "14/12/2025"}</div>
              </div>
              <button className="p-1 hover:bg-gray-100 rounded transition-colors text-[#2D3142]" title="Share"><span className="material-symbols-rounded text-[24px] align-middle">ios_share</span></button>
            </div>
          </div>
        </Container>
        <Container className="max-w-[1360px] relative z-10">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column: Fixed details */}
            <div className="w-full lg:w-[220px] shrink-0 relative z-10">
              <h3 className="font-bold text-lg text-[#2D3142] mb-3">
                Sample Essay
              </h3>
              <p className="text-sm text-[#6A7282] leading-relaxed">
                Review high-scoring IELTS sample essays to improve your writing and speaking skills. Practice makes perfect.
              </p>
            </div>

            {/* Middle Column: Main Content */}
            <div className="w-full lg:flex-1 space-y-6 relative z-10">
              <div className="aspect-[21/10] relative rounded-[24px] overflow-hidden border border-[rgba(0,0,0,0.06)] bg-[#FAF7EB]">
                  <Image
                    src={resolveContentImage(post.featuredImage?.node.sourceUrl, fallbackImage)}
                    alt={post.featuredImage?.node.altText || post.title}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <div className="mt-5 space-y-1.5">
                  
                  <div className="flex justify-between">
                    <div className="flex gap-x-2">
                      <p className="text-xs text-gray-600 flex items-center space-x-1">
                        <span className="material-symbols-rounded text-lg! leading-none!">
                          visibility
                        </span>
                        <span>{post.postMeta?.views || 0}</span>
                      </p>
                      <p className="text-xs text-gray-600 flex items-center space-x-1">
                        <span className="material-symbols-rounded text-lg! leading-none!">
                          calendar_month
                        </span>
                        <span>{dayjs(post.date).format("DD/MM/YYYY")}</span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-[24px] border border-[rgba(0,0,0,0.06)] p-6 md:p-8 mt-6">
                  <div
                    className="text-sm md:text-base text-[#2D3142] leading-relaxed prose prose-sm md:prose-base max-w-none prose-p:!mb-2"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  ></div>
                </div>
                <div className="p-4">
                  <SharePost />
                </div>
              </div>

            {/* Right Column: Related items */}
            <div className="w-full lg:w-[280px] shrink-0 space-y-8 relative z-10">
              {/* Optional: Add related essays component here if available */}
              <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-500">More essays coming soon...</div>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
};
