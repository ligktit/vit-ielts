import Image from "next/image";
import Link from "next/link";
import dayjs from "dayjs";
import { resolveContentImage, useContentImageFallback } from "@/shared/lib/content-image";
import { ProBadge } from "@/shared/ui/pro-badge";
import { skillLabel } from "./skills";
import type { Post } from "~services/types/database";

/**
 * Blog article card used in the per-skill sections of /ielts-prediction.
 * Matches the mockup: image with a skill badge overlay, title, excerpt,
 * #tag chips, then a footer with the date and a "Đọc tiếp" link.
 */
export const ArticleCard = ({ post, href }: { post: Post; href: string }) => {
  const fallbackImage = useContentImageFallback();
  const imageSrc = resolveContentImage(post.featured_image || undefined, fallbackImage);
  const isLogoFallback = !post.featured_image && imageSrc.includes("logo.png");
  const tags = (post.tags || []).slice(0, 3);
  const label = skillLabel(post.skill);

  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(0,0,0,0.12)]"
    >
      <div className="relative h-[200px] shrink-0 overflow-hidden">
        {isLogoFallback && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--color-secondary-200),_white_55%,_var(--color-primary-50))]" />
        )}
        <Image
          src={imageSrc}
          alt={post.title}
          fill
          className={`${isLogoFallback ? "object-contain p-12 opacity-30 mix-blend-multiply" : "object-cover"} transition-transform duration-500 group-hover:scale-105`}
          loading="lazy"
          unoptimized
        />
        {label && (
          <span className="absolute left-3 top-3 rounded-lg bg-white/95 px-2.5 py-1 text-[13px] font-semibold text-primary-500 shadow-sm">
            {label}
          </span>
        )}
        {post.pro_user_only && <ProBadge className="absolute right-3 top-3 shadow-sm" />}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-2 line-clamp-2 text-[18px] font-bold leading-snug text-[#202020] transition-colors group-hover:text-primary-500">
          {post.title}
        </h3>

        {post.excerpt && (
          <p className="mb-4 line-clamp-2 text-[14px] leading-relaxed text-[#6A7282]">
            {post.excerpt}
          </p>
        )}

        {tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[#EEF0F4] px-2.5 py-1 text-[11px] tracking-[-0.4px] font-semibold text-[#4B5563]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-[#F0F0F0] pt-3">
          <span className="text-[13px] text-[#9CA3AF]">
            {post.published_at ? dayjs(post.published_at).format("DD [Thg] MM, YYYY") : ""}
          </span>
          <span className="inline-flex items-center gap-1 text-[14px] font-semibold text-primary-500">
            Đọc tiếp
            <span className="material-symbols-rounded !text-[20px] transition-transform group-hover:translate-x-1">
              arrow_forward
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
};
