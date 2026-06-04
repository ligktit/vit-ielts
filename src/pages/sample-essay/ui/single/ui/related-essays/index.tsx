import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/shared/routes";
import { resolveContentImage, useContentImageFallback } from "@/shared/lib/content-image";
import { TestCard } from "@/shared/ui/ds";

type RelatedEssay = {
  id: string;
  slug: string;
  title: string;
  featured_image: string | null;
};

function RelatedEssays({
  essays,
  skill,
}: {
  essays: RelatedEssay[];
  skill?: string | null;
}) {
  const fallbackImage = useContentImageFallback();

  if (!essays.length) return null;

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="font-bold text-lg text-[#2D3142]">Bài viết nổi bật</h3>
        <TestCard
          title={essays[0].title}
          image={essays[0].featured_image ?? undefined}
          skill={skill as any}
          href={ROUTES.SAMPLE_ESSAY.SINGLE(essays[0].slug)}
          actionText="Xem thêm"
        />
      </div>

      {essays.length > 1 && (
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-[#2D3142]">Có thể bạn quan tâm</h3>
          <div className="space-y-4">
            {essays.slice(1, 4).map((essay) => (
              <Link
                key={essay.id}
                href={ROUTES.SAMPLE_ESSAY.SINGLE(essay.slug)}
                className="flex gap-3 group items-center"
              >
                <div className="w-[100px] h-[65px] relative rounded-lg overflow-hidden shrink-0 border border-[rgba(0,0,0,0.06)] bg-[#FAF7EB]">
                  <Image
                    src={resolveContentImage(essay.featured_image ?? undefined, fallbackImage)}
                    alt={essay.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                    unoptimized
                  />
                </div>
                <h4 className="text-sm font-semibold text-[#2D3142] group-hover:text-primary-500 line-clamp-3 transition-colors">
                  {essay.title}
                </h4>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default RelatedEssays;
