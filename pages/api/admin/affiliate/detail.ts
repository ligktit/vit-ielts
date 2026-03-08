import type { NextApiRequest, NextApiResponse } from "next";

const AFFILIATES_FILE = "affiliates.json";
const LINKS_FILE = "affiliate-links.json";
const COMMISSIONS_FILE = "affiliate-commissions.json";
const VISITS_FILE = "affiliate-visits.json";

async function getAffiliates(): Promise<any[]> {
  try {
    const result = readData<any[]>(AFFILIATES_FILE);
    const data = result instanceof Promise ? await result : result;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error getting affiliates:", error);
    return [];
  }
}

async function getLinks(): Promise<any[]> {
  try {
    const result = readData<any[]>(LINKS_FILE);
    const data = result instanceof Promise ? await result : result;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error getting links:", error);
    return [];
  }
}

async function getCommissions(): Promise<any[]> {
  try {
    const result = readData<any[]>(COMMISSIONS_FILE);
    const data = result instanceof Promise ? await result : result;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error getting commissions:", error);
    return [];
  }
}

async function getVisits(): Promise<any[]> {
  try {
    const result = readData<any[]>(VISITS_FILE);
    const data = result instanceof Promise ? await result : result;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error getting visits:", error);
    return [];
  }
}

// Helper to fetch user email directly from WP
async function fetchUserEmail(userId: string, cookie: string | undefined, cmsUrl: string) {
  console.log('🔍 fetchUserEmail called with:', { userId, hasCookie: !!cookie, cmsUrl });

  try {
    // Decode the base64 user ID to get database ID
    let dbId: number | null = null;
    try {
      if (userId.includes("dXNlc")) {
        const decoded = Buffer.from(userId, 'base64').toString('ascii');
        const parts = decoded.split(':');
        if (parts.length > 1) {
          dbId = parseInt(parts[1], 10);
          console.log('✅ Decoded user ID:', { original: userId, decoded, dbId });
        }
      }
    } catch (e) {
      console.error('❌ Failed to decode user ID:', e);
    }

    const headers = {
      "Content-Type": "application/json",
      "Cookie": cookie || "",
    };

    // Approach 1: Try to get user by ID directly (works if admin has proper permissions)
    const userByIdQuery = `
      query GetUserById($id: ID!) {
        user(id: $id) {
          id
          databaseId
          email
          name
          firstName
          lastName
          username
          nicename
        }
      }
    `;

    // Try with Global ID first
    try {
      console.log('🔄 Attempt 1: Trying user query with Global ID...');
      const res = await fetch(`${cmsUrl}/graphql`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          query: userByIdQuery,
          variables: { id: userId }
        }),
      });
      const json = await res.json();
      console.log('📥 Attempt 1 response:', json);

      if (json.data?.user) {
        const user = json.data.user;
        const email = user.email || user.username || null;
        if (email) {
          console.log('✅ Success with Global ID!', { email, name: user.name });
          return { email, name: user.name || user.firstName || user.nicename };
        }
      }
    } catch (e) {
      console.error("❌ Attempt 1 failed:", e);
    }

    // Try with Database ID if available
    if (dbId) {
      try {
        console.log('🔄 Attempt 2: Trying user query with Database ID...');
        const res = await fetch(`${cmsUrl}/graphql`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            query: userByIdQuery,
            variables: { id: dbId.toString() }
          }),
        });
        const json = await res.json();
        console.log('📥 Attempt 2 response:', json);

        if (json.data?.user) {
          const user = json.data.user;
          const email = user.email || user.username || null;
          if (email) {
            console.log('✅ Success with Database ID!', { email, name: user.name });
            return { email, name: user.name || user.firstName || user.nicename };
          }
        }
      } catch (e) {
        console.error("❌ Attempt 2 failed:", e);
      }

      // Approach 2: Use users list query (might have different permissions)
      try {
        console.log('🔄 Attempt 3: Trying users list query...');
        const listQuery = `
          query GetUsersList($ids: [Int]) {
            users(where: { include: $ids }) {
              nodes {
                id
                databaseId
                email
                name
                firstName
                lastName
                username
                nicename
              }
            }
          }
        `;

        const res = await fetch(`${cmsUrl}/graphql`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            query: listQuery,
            variables: { ids: [dbId] }
          }),
        });
        const json = await res.json();
        console.log('📥 Attempt 3 response:', json);

        if (json.data?.users?.nodes?.length > 0) {
          const user = json.data.users.nodes[0];
          const email = user.email || user.username || null;
          if (email) {
            console.log('✅ Success with List query!', { email, name: user.name });
            return { email, name: user.name || user.firstName || user.nicename };
          }
        }
      } catch (e) {
        console.error("❌ Attempt 3 failed:", e);
      }
    }

    console.log('❌ All attempts failed - Could not fetch user email');
    return null;
  } catch (error) {
    console.error("❌ Error in fetchUserEmail:", error);
    return null;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { affiliateId } = req.query;

    if (!affiliateId || typeof affiliateId !== "string") {
      return res.status(400).json({
        success: false,
        error: "Affiliate ID is required"
      });
    }

    const affiliates = await getAffiliates();
    const affiliate = affiliates.find((a: any) => a.id === affiliateId);

    if (!affiliate) {
      console.error("Affiliate not found. Requested ID:", affiliateId);
      return res.status(404).json({
        success: false,
        error: "Affiliate not found"
      });
    }

    // Get all related data
    let links: any[] = [];
    let commissions: any[] = [];
    let visits: any[] = [];

    try {
      links = (await getLinks()).filter((l: any) => l.affiliateId === affiliateId);
    } catch (error) {
      console.error("Error fetching links:", error);
      links = [];
    }

    try {
      commissions = (await getCommissions()).filter((c: any) => c.affiliateId === affiliateId);
    } catch (error) {
      console.error("Error fetching commissions:", error);
      commissions = [];
    }

    try {
      visits = (await getVisits()).filter((v: any) => v.affiliateId === affiliateId);
    } catch (error) {
      console.error("Error fetching visits:", error);
      visits = [];
    }

    // Email and name should come from the affiliate record itself
    // They are captured during registration from the user's viewer query
    console.log('📧 Affiliate data:', {
      hasEmail: !!affiliate.email,
      email: affiliate.email,
      hasName: !!affiliate.name,
      name: affiliate.name
    });

    // Calculate stats
    const totalCommissions = commissions.reduce(
      (sum: number, c: any) => sum + c.commissionAmount,
      0
    );
    const pendingCommissions = commissions
      .filter((c: any) => c.status === "pending")
      .reduce((sum: number, c: any) => sum + c.commissionAmount, 0);
    const paidCommissions = commissions
      .filter((c: any) => c.status === "paid")
      .reduce((sum: number, c: any) => sum + c.commissionAmount, 0);
    const totalVisits = visits.length;
    const totalConversions = visits.filter((v: any) => v.converted).length;
    const conversionRate =
      totalVisits > 0 ? (totalConversions / totalVisits) * 100 : 0;

    return res.status(200).json({
      success: true,
      affiliate: {
        ...affiliate,
        stats: {
          totalLinks: Array.isArray(links) ? links.length : 0,
          totalVisits: Array.isArray(visits) ? visits.length : 0,
          totalConversions: Array.isArray(visits) ? visits.filter((v: any) => v.converted).length : 0,
          conversionRate: Math.round(conversionRate * 100) / 100,
          totalCommissions,
          pendingCommissions,
          paidCommissions,
        },
      },
      links: Array.isArray(links) ? links : [],
      commissions: Array.isArray(commissions) ? commissions.slice(0, 10) : [],
      visits: Array.isArray(visits) ? visits.slice(0, 10) : [],
    });
  } catch (error) {
    console.error("Error fetching affiliate detail:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error details:", {
      affiliateId: req.query.affiliateId,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return res.status(500).json({
      success: false,
      error: "Failed to fetch affiliate detail",
      message: errorMessage,
    });
  }
}
