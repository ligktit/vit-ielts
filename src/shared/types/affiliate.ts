export interface AffiliateUser {
  id: string;
  userId: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  approvedAt?: string;
  customLink?: string;
  emailNotifications: boolean;
}

export interface AffiliateLink {
  id: string;
  affiliateId: string;
  link: string;
  customLink?: string;
  createdAt: string;
}

export interface AffiliateVisit {
  id: string;
  affiliateId: string;
  linkId: string;
  ipAddress?: string;
  userAgent?: string;
  referer?: string;
  visitedAt: string;
  converted: boolean;
  orderId?: string;
}

export interface AffiliateCommission {
  id: string;
  affiliateId: string;
  orderId: string;
  amount: number;
  commissionRate: number;
  commissionAmount: number;
  status: "pending" | "paid" | "cancelled";
  createdAt: string;
  paidAt?: string;
}

export interface AffiliatePayment {
  id: string;
  affiliateId: string;
  totalAmount: number;
  period: string; // YYYY-MM format
  status: "pending" | "paid";
  paidAt?: string;
  createdAt: string;
  commissions: AffiliateCommission[];
}

export interface AffiliateStats {
  totalBalance: number;
  totalCommissions: number;
  totalVisits: number;
  totalConversions: number;
  conversionRate: number;
  pendingCommissions: number;
  paidCommissions: number;
}

