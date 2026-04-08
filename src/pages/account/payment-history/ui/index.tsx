import { MyProfileLayout } from "@/widgets/layouts";
import { Card, Skeleton, Table, TableProps, Tag, Button } from "antd";
import { useEffect, useMemo, useState, useCallback } from "react";
import dayjs from "dayjs";
import { currencyFormat } from "@/shared/lib";
import { createClient } from "~supabase/client";
import { useAuth } from "@/appx/providers";
import Link from "next/link";
import { ROUTES } from "@/shared/routes";

// ─── Constants ───────────────────────────────────────────────
const ORDER_TTL_MINUTES = 60;

// ─── Helpers ─────────────────────────────────────────────────

/** Check if an order is still within the payment window */
const isOrderPayable = (order: any): boolean => {
  if (order.status !== "pending") return false;
  const ageMs = Date.now() - new Date(order.created_at).getTime();
  return ageMs < ORDER_TTL_MINUTES * 60 * 1000;
};

/** Get remaining seconds before an order expires */
const getTimeRemaining = (createdAt: string): number => {
  const expiresAt = new Date(createdAt).getTime() + ORDER_TTL_MINUTES * 60 * 1000;
  return Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
};

/** Format seconds to "mm:ss" */
const formatCountdown = (totalSeconds: number): string => {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

/** Compute status display */
const getStatusDisplay = (order: any): { text: string; color: string; showContinue: boolean } => {
  switch (order.status) {
    case "completed":
      return { text: "Thành công", color: "#34D399", showContinue: false };
    case "cancelled":
      return { text: "Đã hủy", color: "#F87171", showContinue: false };
    case "expired":
      return { text: "Đã hết hạn", color: "#9CA3AF", showContinue: false };
    case "pending":
      if (isOrderPayable(order)) {
        return { text: "Chờ thanh toán", color: "#FBBF24", showContinue: true };
      }
      // Pending but past TTL (cron hasn't run yet)
      return { text: "Sắp hết hạn", color: "#F97316", showContinue: false };
    default:
      return { text: order.status, color: "#9CA3AF", showContinue: false };
  }
};

// Hàm tạo Order ID từ paymentDate
const generateOrderId = (paymentDate: string, index: number): string => {
  const hash = paymentDate
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return `#${(hash + index).toString().slice(-4)}`;
};

// ─── Countdown Component ─────────────────────────────────────
const Countdown = ({ createdAt }: { createdAt: string }) => {
  const [remaining, setRemaining] = useState(() => getTimeRemaining(createdAt));

  useEffect(() => {
    if (remaining <= 0) return;
    const interval = setInterval(() => {
      const next = getTimeRemaining(createdAt);
      setRemaining(next);
      if (next <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [createdAt, remaining]);

  if (remaining <= 0) return null;

  const isUrgent = remaining < 300; // < 5 minutes

  return (
    <span className={`text-xs font-medium ${isUrgent ? "text-red-500" : "text-gray-400"}`}>
      Còn {formatCountdown(remaining)}
    </span>
  );
};

// ─── Page Component ──────────────────────────────────────────
export const PagePaymentHistory = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const supabase = createClient();
        const { data: orderData } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", currentUser.id)
          .order("created_at", { ascending: false });

        setOrders(orderData || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [currentUser?.id]);

  const dataSource = useMemo(() => {
    return orders.map((order: any, index: number) => {
      const statusInfo = getStatusDisplay(order);
      return {
        key: index,
        orderId: order.id ? `#${String(order.id).slice(-4)}` : generateOrderId(order.created_at || "", index),
        orderIdFull: order.order_id,
        content: order.plan_name || order.transfer_content || "Pro Subscription",
        paymentDate: order.created_at,
        amount: order.amount || 0,
        status: statusInfo,
        rawOrder: order,
      };
    });
  }, [orders]);

  const columns: TableProps<(typeof dataSource)[number]>["columns"] = [
    {
      title: "Order ID",
      dataIndex: "orderId",
      key: "orderId",
      render: (orderId: string) => (
        <span className="text-gray-700">{orderId}</span>
      ),
    },
    {
      title: "Course Name",
      dataIndex: "content",
      key: "content",
      render: (content: string) => (
        <span className="text-gray-700">{content}</span>
      ),
    },
    {
      title: "Date",
      dataIndex: "paymentDate",
      key: "paymentDate",
      render: (paymentDate: string) => (
        <span className="text-gray-700">
          {dayjs(paymentDate).format("MMMM D, YYYY")}
        </span>
      ),
    },
    {
      title: "Price",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => (
        <span className="text-gray-700">{currencyFormat(amount)}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: { text: string; color: string; showContinue: boolean }, record: (typeof dataSource)[number]) => (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Tag
              style={{
                backgroundColor: status.color,
                color: "#ffffff",
                border: "none",
                borderRadius: "4px",
                padding: "4px 12px",
                fontWeight: 500,
              }}
            >
              {status.text}
            </Tag>
            {status.showContinue && (
              <Countdown createdAt={record.rawOrder.created_at} />
            )}
          </div>
          {status.showContinue && record.orderIdFull && (
            <Link
              href={`${ROUTES.ORDER_RECEIVED}?orderId=${encodeURIComponent(record.orderIdFull)}`}
            >
              <Button
                type="primary"
                size="small"
                style={{
                  backgroundColor: "#D94A56",
                  borderColor: "#D94A56",
                  fontSize: "12px",
                  fontWeight: 600,
                  borderRadius: "6px",
                }}
              >
                Tiếp tục thanh toán
              </Button>
            </Link>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <style jsx global>{`
        .order-history-table .ant-table-thead > tr > th {
          background: #c7ccf1 !important;
          border-bottom: 1px solid #e5e7eb;
          border-right: none !important;
          padding: 12px 16px;
          font-weight: 700 !important;
          color: #000000 !important;
        }
        .order-history-table .ant-table-thead > tr > th::before {
          display: none !important;
        }
        .order-history-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #e5e7eb;
          padding: 12px 16px;
        }
        .order-history-table .ant-table-tbody > tr:hover > td {
          background: inherit !important;
        }
        .order-history-table .ant-table-tbody > tr.bg-gray-50 > td {
          background-color: #f9fafb;
        }
        .order-history-table .ant-table-tbody > tr.bg-white > td {
          background-color: #ffffff;
        }
      `}</style>
      <Card className="shadow-sm rounded-lg" bodyStyle={{ padding: 0 }}>
        <div className="p-6">
          {!loading ? (
            <Table
              dataSource={dataSource}
              columns={columns}
              pagination={false}
              className="order-history-table"
              rowClassName={(_, index) =>
                index % 2 === 0 ? "bg-white" : "bg-gray-50"
              }
            />
          ) : (
            <Skeleton active />
          )}
        </div>
      </Card>
    </>
  );
};

PagePaymentHistory.Layout = MyProfileLayout;
