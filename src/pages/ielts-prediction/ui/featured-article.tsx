import Image from "next/image";
import Link from "next/link";
import dayjs from "dayjs";
import { resolveContentImage, useContentImageFallback } from "@/shared/lib/content-image";
import { skillLabel } from "./skills";
import type { Post } from "~services/types/database";

/**
 * Large "Featured Article" hero card at the top of /ielts-prediction:
 * image on the left, skill·topic label + title + excerpt + tags on the right,
 * with a date and "Đọc tiếp" in the footer.
 */
export const FeaturedArticle = ({ post, href }: { post: Post; href: string }) => {
  const fallbackImage = useContentImageFallback();
  const imageSrc = resolveContentImage(post.featured_image || undefined, fallbackImage);
  const isLogoFallback = !post.featured_image && imageSrc.includes("logo.png");
  const label = skillLabel(post.skill);
  const topic = (post.tags || [])[0] || (post.categories || []).find((c) => c !== "IELTS Prediction");
  const eyebrow = [label, topic].filter(Boolean).join(" · ");
  const tags = (post.tags || []).slice(0, 3);

  return (
    <Link
      href={href}
      className="group grid grid-cols-1 overflow-hidden rounded-3xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] md:grid-cols-2"
    >
      <div className="relative min-h-[260px] overflow-hidden">
        {isLogoFallback && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--color-secondary-200),_white_55%,_var(--color-primary-50))]" />
        )}
        <Image
          src={imageSrc}
          alt={post.title}
          fill
          className={`${isLogoFallback ? "object-contain p-12 opacity-30 mix-blend-multiply" : "object-cover"} transition-transform duration-500 group-hover:scale-105`}
          priority
          unoptimized
        />
      </div>

      <div className="flex flex-col justify-center p-7 lg:p-9">
        {eyebrow && (
          <span className="mb-3 w-fit rounded-md bg-primary-50 px-2.5 py-1 text-[12px] font-semibold text-primary-500">
            {eyebrow}
          </span>
        )}
        <h2 className="mb-4 text-[22px] font-extrabold leading-tight text-[#1F2430] transition-colors group-hover:text-primary-500 lg:text-[26px]">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="mb-5 line-clamp-3 text-[15px] leading-relaxed text-[#6A7282]">
            {post.excerpt}
          </p>
        )}

        {tags.length > 0 && (
          <div className="mb-5 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[#EEF0F4] px-3 py-1 text-[12px] tracking-[-0.3px] font-semibold text-[#4B5563]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-[#F0F0F0] pt-4">
          <span className="inline-flex items-center gap-1.5 text-[14px] text-[#9CA3AF]">
            <span className="material-symbols-rounded text-[16px]">calendar_today</span>
            {post.published_at ? dayjs(post.published_at).format("DD [Thg] MM, YYYY") : ""}
          </span>
          <span className="inline-flex items-center gap-1 text-[15px] font-semibold text-primary-500">
            Đọc tiếp
            <span className="material-symbols-rounded text-[18px] transition-transform group-hover:translate-x-1">
              arrow_forward
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
};
