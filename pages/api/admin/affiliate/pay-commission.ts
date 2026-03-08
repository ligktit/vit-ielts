import type { NextApiRequest, NextApiResponse } from "next";

const COMMISSIONS_FILE = "affiliate-commissions.json";

async function getCommissions(): Promise<any[]> {
  try {
    const data = await Promise.resolve(readData<any[]>(COMMISSIONS_FILE));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function saveCommissions(commissions: any[]): Promise<void> {
  await Promise.resolve(writeData<any[]>(COMMISSIONS_FILE, commissions));
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { commissionId } = req.body;

    if (!commissionId || typeof commissionId !== "string") {
      return res.status(400).json({ error: "Commission ID is required" });
    }

    const commissions = await getCommissions();
    const commissionIndex = commissions.findIndex(
      (c: any) => c.id === commissionId
    );

    if (commissionIndex === -1) {
      return res.status(404).json({ error: "Commission not found" });
    }

    const commission = commissions[commissionIndex];

    if (commission.status === "paid") {
      return res.status(400).json({ 
        error: "Commission already paid",
        message: "Hoa hồng này đã được thanh toán rồi"
      });
    }

    if (commission.status !== "pending") {
      return res.status(400).json({ 
        error: "Invalid commission status",
        message: "Chỉ có thể thanh toán hoa hồng đang chờ thanh toán"
      });
    }

    // Update commission status to paid
    commissions[commissionIndex] = {
      ...commission,
      status: "paid",
      paidAt: new Date().toISOString(),
    };

    await saveCommissions(commissions);

    return res.status(200).json({
      success: true,
      message: "Thanh toán hoa hồng thành công",
      commission: commissions[commissionIndex],
    });
  } catch (error) {
    console.error("Error paying commission:", error);
    return res.status(500).json({
      error: "Failed to pay commission",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

