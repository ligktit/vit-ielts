import Image from "next/image";

export const PageLoader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center flex-col pointer-events-none">
      <div className="w-28 md:w-44 aspect-[750/449] relative animate-pulse">
        <Image
          sizes="100%"
          alt="logo"
          src="/logo.png"
          priority
          fill
          className="object-contain"
        />
      </div>
    </div>
  );
};
