import Image from "next/image";

function Empty({ title, subtitle }: { title?: string; subtitle?: string }) {
  return (
    <div className="text-center pb-10">
      <div className="relative aspect-video">
        <Image
          src="/nvtAtNNGQZ6WdMABgvuO.webp"
          alt="no result"
          priority
          fill
          sizes="100%"
        />
      </div>
      {title && (
        <p className="text-2xl font-extrabold font-nunito text-red-800">
          {title}
        </p>
      )}
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}

export default Empty;
