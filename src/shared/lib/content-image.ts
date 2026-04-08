import { useAppContext } from "@/appx/providers";

export const DEFAULT_CONTENT_IMAGE = "/assets/figma/icons/logo.png";

export function resolveContentImage(
  image?: string | null | false,
  fallbackImage?: string | null | false,
): string {
  const primaryImage = typeof image === "string" ? image.trim() : "";
  if (primaryImage) return primaryImage;

  const configuredFallback = typeof fallbackImage === "string" ? fallbackImage.trim() : "";
  if (configuredFallback) return configuredFallback;

  return DEFAULT_CONTENT_IMAGE;
}

export function useContentImageFallback(): string {
  const { masterData } = useAppContext();

  return resolveContentImage(
    undefined,
    masterData?.websiteOptions?.websiteOptionsFields?.generalSettings?.defaultContentImage?.node?.sourceUrl,
  );
}
