export const PRICING_TIERS = {
  combo: {
    1: 200000,
    2: 400000,
    3: 600000,
    4: 800000,
    5: 1000000,
    6: 1000000,
    7: 1400000,
    8: 1600000,
    9: 1800000,
    10: 2000000,
    11: 2200000,
    12: 1800000,
  },
  single: {
    2: 200000,
    3: 300000,
    4: 400000,
    5: 500000,
    6: 500000,
    7: 700000,
    8: 800000,
    9: 900000,
    10: 1000000,
    11: 1100000,
    12: 900000,
  },
} as const;

export type PackageType = "combo" | "single";
export type SkillType = "listening" | "reading";

export interface SubscriptionSelection {
  packageType: PackageType;
  skillType?: SkillType;
  duration: number;
  totalPrice: number;
}

/**
 * Get price for a given package type and duration
 * Falls back to nearest lower tier if exact match not found
 * Or calculates dynamically if basePrice and monthlyIncrementPrice are provided
 */
export function calculatePrice(
  packageType: PackageType,
  duration: number,
  basePrice?: number,
  monthlyIncrementPrice?: number,
  priceTable?: Record<number, number>
): number | null {
  // Single-skill plans must be at least 2 months
  if (packageType === "single" && duration < 1) {
    return null;
  }
  if (packageType === "combo" && duration < 1) {
    return null;
  }

  if (priceTable && priceTable[duration] !== undefined) {
    return priceTable[duration];
  }

  if (basePrice !== undefined && monthlyIncrementPrice !== undefined) {
    return basePrice + (duration - 1) * monthlyIncrementPrice;
  }

  const tiers = PRICING_TIERS[packageType];
  const price = tiers[duration as keyof typeof tiers];

  return price ?? null;
}

// Backward compatibility wrapper
export const getPrice = calculatePrice;

/**
 * Format price to VND currency
 */
export function formatPrice(price: number | null): string {
  if (price === null) return "N/A";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

