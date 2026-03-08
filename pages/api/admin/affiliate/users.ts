import type { NextApiRequest, NextApiResponse } from "next";

const AFFILIATES_FILE = "affiliates.json";
const LINKS_FILE = "affiliate-links.json";
const COMMISSIONS_FILE = "affiliate-commissions.json";
const VISITS_FILE = "affiliate-visits.json";

interface AffiliateUser {
  id: string;
  userId: string;
  email?: string;
  name?: string;
  commissionRate?: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  customLink?: string;
  emailNotifications: boolean;
}

async function getAffiliates(): Promise<AffiliateUser[]> {
  try {
    const result = readData<AffiliateUser[]>(AFFILIATES_FILE);
    const data = result instanceof Promise ? await result : result;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error getting affiliates:", error);
    return [];
  }
}

async function saveAffiliates(affiliates: AffiliateUser[]): Promise<void> {
  const result = writeData<AffiliateUser[]>(AFFILIATES_FILE, affiliates);
  if (result instanceof Promise) {
    await result;
  }
}

async function getLinks(): Promise<any[]> {
  try {
    const result = readData<any[]>(LINKS_FILE);
    const data = result instanceof Promise ? await result : result;
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function getCommissions(): Promise<any[]> {
  try {
    const result = readData<any[]>(COMMISSIONS_FILE);
    const data = result instanceof Promise ? await result : result;
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function getVisits(): Promise<any[]> {
  try {
    const result = readData<any[]>(VISITS_FILE);
    const data = result instanceof Promise ? await result : result;
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const affiliates = await getAffiliates();
      const allLinks = await getLinks();
      const allCommissions = await getCommissions();
      const allVisits = await getVisits();

      // Enrich affiliates with stats
      const affiliatesWithStats = affiliates.map((affiliate: AffiliateUser) => {
        const links = allLinks.filter((l: any) => l.affiliateId === affiliate.id);
        const commissions = allCommissions.filter((c: any) => c.affiliateId === affiliate.id);
        const visits = allVisits.filter((v: any) => v.affiliateId === affiliate.id);

        const totalCommissions = commissions.reduce(
          (sum: number, c: any) => sum + c.commissionAmount,
          0
        );
        const pendingCommissions = commissions
          .filter((c: any) => c.status === "pending")
          .reduce((sum: number, c: any) => sum + c.commissionAmount, 0);
        const totalVisits = visits.length;
        const totalConversions = visits.filter((v: any) => v.converted).length;

        return {
          ...affiliate,
          stats: {
            totalLinks: links.length,
            totalVisits,
            totalConversions,
            totalCommissions,
            pendingCommissions,
          },
        };
      });

      return res.status(200).json({
        success: true,
        affiliates: affiliatesWithStats,
      });
    } catch (error) {
      console.error("Error fetching affiliates:", error);
      return res.status(500).json({
        error: "Failed to fetch affiliates",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  if (req.method === "POST") {
    try {
      const { action, affiliateId, status, customLink, commissionRate, email } = req.body;

      if (!action || !affiliateId) {
        return res.status(400).json({ error: "Action and affiliate ID are required" });
      }

      const affiliates = await getAffiliates();
      const affiliateIndex = affiliates.findIndex((a) => a.id === affiliateId);

      if (affiliateIndex === -1) {
        return res.status(404).json({ error: "Affiliate not found" });
      }

      const affiliate = affiliates[affiliateIndex];

      if (action === "approve") {
        affiliate.status = "approved";
        affiliate.approvedAt = new Date().toISOString();
        if (customLink) affiliate.customLink = customLink;
        if (commissionRate !== undefined) affiliate.commissionRate = Number(commissionRate);
        if (email) affiliate.email = email;
      } else if (action === "reject") {
        affiliate.status = "rejected";
        affiliate.rejectedAt = new Date().toISOString();
      } else if (action === "update") {
        if (status) affiliate.status = status;
        if (customLink !== undefined) affiliate.customLink = customLink;
        if (commissionRate !== undefined) affiliate.commissionRate = Number(commissionRate);
        if (email) affiliate.email = email;
      }

      affiliates[affiliateIndex] = affiliate;
      await saveAffiliates(affiliates);

      return res.status(200).json({
        success: true,
        affiliate,
        message: `Affiliate ${action === "approve" ? "approved" : action === "reject" ? "rejected" : "updated"} successfully`,
      });
    } catch (error) {
      console.error("Error updating affiliate:", error);
      return res.status(500).json({
        error: "Failed to update affiliate",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}

