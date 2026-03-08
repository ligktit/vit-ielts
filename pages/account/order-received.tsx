import { withAuth, withMasterData, withMultipleWrapper } from "@/shared/hoc";
import type { GetServerSideProps, GetServerSidePropsContext } from "next";
import { supabaseAdmin } from "~supabase/admin";
import { getOrderById } from "~services/order";
import { MyProfileLayout } from "@/widgets/layouts";
import Link from "next/link";
import { ROUTES } from "@/shared/routes";
import { formatPrice } from "@/pages/subscription/ui/subscription-plans/pricing";
import dayjs from "dayjs";
import { CheckCircle } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState, useRef } from "react";
import { Modal, Button } from "antd";
import { useRouter } from "next/router";

const CopyButton = dynamic(() => import("./copy-button"), { ssr: false });

interface OrderData {
  orderId: string;
  amount: number;
  createdAt: string;
  paymentMethod: string;
  transferContent: string;
  status: string;
}

interface OrderReceivedPageProps {
  order: OrderData | null;
  error?: string;
}

const OrderReceivedPage = ({ order: initialOrder, error }: OrderReceivedPageProps) => {
  const router = useRouter();
  const [order, setOrder] = useState<OrderData | null>(initialOrder);
  const [isPaymentSuccessModalOpen, setIsPaymentSuccessModalOpen] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasShownSuccessModalRef = useRef(false);

  // Polling để check order status
  useEffect(() => {
    if (!order || order.status === "completed" || error) {
      return;
    }

    // Chỉ polling nếu order đang pending
    if (order.status === "pending") {
      setIsPolling(true);

      const pollOrderStatus = async () => {
        try {
          const res = await fetch(`/api/orders/${order.orderId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.order) {
              const newStatus = data.order.orderFields.status;

              // Nếu status chuyển sang completed và chưa hiển thị modal
              if (newStatus === "completed" && !hasShownSuccessModalRef.current) {
                setOrder((prevOrder) => {
                  if (!prevOrder) return prevOrder;
                  return {
                    ...prevOrder,
                    status: "completed",
                  };
                });
                setIsPaymentSuccessModalOpen(true);
                hasShownSuccessModalRef.current = true;
                setIsPolling(false);

                // Dừng polling
                if (pollingIntervalRef.current) {
                  clearInterval(pollingIntervalRef.current);
                  pollingIntervalRef.current = null;
                }
              } else if (newStatus !== order.status) {
                // Cập nhật status nếu có thay đổi
                setOrder((prevOrder) => {
                  if (!prevOrder) return prevOrder;
                  return {
                    ...prevOrder,
                    status: newStatus,
                  };
                });
              }
            }
          }
        } catch (error) {
          console.error("Error polling order status:", error);
        }
      };

      // Poll ngay lập tức, sau đó mỗi 5 giây
      pollOrderStatus();
      pollingIntervalRef.current = setInterval(pollOrderStatus, 5000);

      // Cleanup khi component unmount
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [order?.status, order?.orderId, error]);

  // Cleanup polling khi component unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  if (error || !order) {
    return (
      <div className="flex justify-center min-h-[60vh] items-center px-4">
        <div className="w-full max-w-2xl bg-white shadow-lg rounded-2xl border border-gray-200 p-8">
          <div className="text-center">
            <h1 className="text-3xl font-black text-gray-900 mb-4">
              Không tìm thấy đơn hàng
            </h1>
            <p className="text-gray-600 mb-8">
              {error || "Đơn hàng không tồn tại hoặc đã bị xóa."}
            </p>
            <Link
              href={ROUTES.SUBSCRIPTION}
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-semibold transition shadow-md hover:shadow-lg"
            >
              Trở về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const displayOrderId = `#${order.orderId}`;
  const displayAmount = formatPrice(order.amount);
  const displayDate = dayjs(order.createdAt).format("DD [Tháng] MM, YYYY");
  const displayMethod = order.paymentMethod;
  const displayNote = order.transferContent;

  return (
    <div className="flex justify-center min-h-[60vh] px-4 py-8">
      <div className="w-full max-w-4xl space-y-6">
        {/* Success Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Đơn hàng của bạn đã được đặt thành công!
          </h1>
          <p className="text-gray-600 text-base leading-relaxed max-w-2xl mx-auto">
            Vui lòng <span className="font-bold text-gray-900">không tắt trình duyệt</span> cho đến khi
            nhận được <span className="font-bold text-gray-900">kết quả giao dịch</span> trên website.
            <br className="hidden sm:block" />
            <span className="block sm:inline"> Hệ thống sẽ kiểm tra và xử lý sau vào vài phút...</span>
          </p>
        </div>

        {/* Bank Transfer Section */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-green-600 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white font-bold text-lg px-6 py-4 text-center">
            CHUYỂN KHOẢN ĐỂ THANH TOÁN
          </div>

          <div className="p-6 space-y-4">
            {/* Bank Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow label="Tên tài khoản" value="TRAN PHAN TIEN PHAT" />
              <InfoRow label="Số tài khoản" value="2447967" />
              <InfoRow label="Ngân hàng" value="Thương Mại Cổ Phần Á Châu (ACB)" />
              <InfoRow label="Số tiền" value={displayAmount.replace("đ", "vnd")} />
              <InfoRow label="Nội dung chuyển khoản" value={displayNote} className="md:col-span-2" />
              <InfoRow
                label="Trạng thái"
                value={order.status === "completed" ? "Đã thanh toán thành công" : "Chờ thanh toán"}
                className="md:col-span-2"
              />
            </div>

            {/* Important Notice */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg mt-6">
              <p className="text-yellow-800 font-bold text-sm leading-relaxed">
                ⚠️ VUI LÒNG NHẬP CHÍNH XÁC NỘI DUNG CHUYỂN KHOẢN ĐỂ HỆ THỐNG KIỂM TRA VÀ KÍCH HOẠT TỰ ĐỘNG
              </p>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center py-6">
              <div className="w-64 h-64 rounded-xl overflow-hidden mb-4 border-2 border-gray-200">
                <img
                  src={`https://qr.sepay.vn/img?acc=2447967&bank=ACB&amount=${order.amount}&des=${encodeURIComponent(order.orderId)}`}
                  alt="QR Code chuyển khoản"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Copy Transfer Content Button */}
              <CopyButton text={displayNote} />
            </div>

            {/* Footer Instructions */}
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <p className="text-center text-gray-600 text-sm leading-relaxed mx-auto max-w-[450px]">
                Sau khi hoàn tất chuyển khoản, vui lòng <span className="font-semibold">không tắt trình duyệt</span> cho đến khi nhận được
                kết quả giao dịch trên website. Xin cảm ơn!
              </p>
              <div className="flex items-center justify-center gap-2">
                {order.status === "completed" ? (
                  <>
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <p className="font-semibold text-green-700">Đã thanh toán thành công</p>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="font-semibold text-green-700">
                      {isPolling ? "Đang kiểm tra thanh toán..." : "Đang chờ chuyển khoản"}
                    </p>
                  </>
                )}
              </div>
              <div className="flex justify-center pt-2">
                <a
                  href="tel:0927090848"
                  className="px-6 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition text-sm"
                >
                  📞 Báo cáo sự cố: 0927090848
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <p className="text-center text-gray-600 mb-6">
            Cảm ơn bạn. Đơn hàng của bạn đã được nhận.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SummaryBox label="Mã đơn" value={displayOrderId} />
            <SummaryBox label="Thời gian" value={displayDate} />
            <SummaryBox label="Thanh toán" value={displayAmount} />
            <SummaryBox label="Hình thức" value={displayMethod} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href={ROUTES.SUBSCRIPTION}
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white font-semibold transition shadow-md hover:shadow-lg"
          >
            Trở về trang chủ
          </Link>
          <Link
            href={ROUTES.ACCOUNT.ORDER_HISTORY}
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold transition"
          >
            Xem lịch sử đơn hàng
          </Link>
        </div>
      </div>

      {/* Payment Success Modal */}
      <Modal
        open={isPaymentSuccessModalOpen}
        onCancel={() => setIsPaymentSuccessModalOpen(false)}
        footer={null}
        centered
        closable={true}
        width={500}
      >
        <div className="text-center py-6">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Thanh toán thành công!
          </h2>
          <p className="text-gray-600 mb-6">
            Đơn hàng <span className="font-semibold">{displayOrderId}</span> của bạn đã được thanh toán thành công.
            <br />
            Tài khoản Pro đã được kích hoạt.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              type="primary"
              size="large"
              onClick={() => {
                setIsPaymentSuccessModalOpen(false);
                router.push(ROUTES.ACCOUNT.DASHBOARD);
              }}
              className="bg-yellow-500 hover:bg-yellow-600 border-none"
            >
              Vào Dashboard
            </Button>
            <Button
              size="large"
              onClick={() => setIsPaymentSuccessModalOpen(false)}
            >
              Ở lại trang này
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const InfoRow = ({
  label,
  value,
  className = ""
}: {
  label: string;
  value: string;
  className?: string;
}) => (
  <div className={`bg-gray-50 rounded-lg p-4 border border-gray-200 ${className}`}>
    <div className="text-xs uppercase text-gray-500 font-semibold mb-1 tracking-wide">
      {label}
    </div>
    <div className="text-base font-bold text-gray-900 break-all">
      {value}
    </div>
  </div>
);

const SummaryBox = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-4 text-center">
    <p className="text-xs uppercase text-gray-500 font-semibold mb-2 tracking-wide">
      {label}
    </p>
    <p className="text-lg font-bold text-gray-900 break-words">
      {value}
    </p>
  </div>
);

OrderReceivedPage.Layout = MyProfileLayout;

export default OrderReceivedPage;

export const getServerSideProps: GetServerSideProps = withMultipleWrapper(
  withAuth,
  withMasterData,
  async (context: GetServerSidePropsContext) => {
    const { orderId } = context.query;

    if (!orderId || typeof orderId !== "string") {
      return {
        props: {
          order: null,
          error: "Order ID is required",
        },
      };
    }

    try {
      const orderRow = await getOrderById(supabaseAdmin, orderId);

      if (!orderRow) {
        return {
          props: {
            order: null,
            error: "Order not found",
          },
        };
      }

      return {
        props: {
          order: {
            orderId: orderRow.order_id,
            amount: orderRow.amount,
            createdAt: orderRow.created_at,
            paymentMethod: orderRow.payment_method ?? "bank_transfer",
            transferContent: orderRow.transfer_content ?? orderRow.order_id,
            status: orderRow.status,
          },
        },
      };
    } catch (error) {
      console.error("Error fetching order:", error);
      return {
        props: {
          order: null,
          error: "Failed to fetch order information",
        },
      };
    }
  }
);

