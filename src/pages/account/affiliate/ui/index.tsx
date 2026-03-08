"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/appx/providers/auth-provider";
import { MyProfileLayout } from "@/widgets/layouts";
import { toast } from "react-toastify";
import { Tabs, Card, Button, Input, Table, Tag, Statistic, Space, message } from "antd";
import {
  DollarOutlined,
  EyeOutlined,
  LinkOutlined,
  CheckCircleOutlined,
  CopyOutlined,
  SettingOutlined
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { formatPrice } from "@/pages/subscription/ui/subscription-plans/pricing";

const { TabPane } = Tabs;

interface AffiliateUser {
  id: string;
  userId: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  approvedAt?: string;
  customLink?: string;
  emailNotifications: boolean;
  commissionRate?: number;
}

interface AffiliateLink {
  id: string;
  affiliateId: string;
  link: string;
  customLink?: string;
  createdAt: string;
}

interface AffiliateStats {
  totalBalance: number;
  totalCommissions: number;
  totalVisits: number;
  totalConversions: number;
  conversionRate: number;
  pendingCommissions: number;
  paidCommissions: number;
}

interface Commission {
  id: string;
  orderId: string;
  amount: number;
  commissionAmount: number;
  status: "pending" | "paid" | "cancelled";
  createdAt: string;
}

interface Visit {
  id: string;
  linkId: string;
  visitedAt: string;
  converted: boolean;
  orderId?: string;
}

export const PageAffiliate = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [affiliate, setAffiliate] = useState<AffiliateUser | null>(null);
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [customLink, setCustomLink] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);

  useEffect(() => {
    if (currentUser?.id) {
      fetchAffiliateData();
    }
  }, [currentUser]);

  const fetchAffiliateData = async () => {
    if (!currentUser?.id) return;

    try {
      setLoading(true);

      // Check if user is affiliate
      const affiliateRes = await fetch(`/api/affiliate/register?userId=${currentUser.id}`);
      const affiliateData = await affiliateRes.json();

      if (affiliateData.success && affiliateData.affiliate) {
        setAffiliate(affiliateData.affiliate);
        setEmailNotifications(affiliateData.affiliate.emailNotifications);

        // Fetch stats, links, commissions, visits
        const [statsRes, linksRes, commissionsRes, visitsRes] = await Promise.all([
          fetch(`/api/affiliate/stats?affiliateId=${affiliateData.affiliate.id}`),
          fetch(`/api/affiliate/links?affiliateId=${affiliateData.affiliate.id}`),
          fetch(`/api/affiliate/commissions?affiliateId=${affiliateData.affiliate.id}`),
          fetch(`/api/affiliate/visits?affiliateId=${affiliateData.affiliate.id}`),
        ]);

        const statsData = await statsRes.json();
        const linksData = await linksRes.json();
        const commissionsData = await commissionsRes.json();
        const visitsData = await visitsRes.json();

        if (statsData.success) setStats(statsData.stats);
        if (linksData.success) {
          // Ensure we only show unique links (remove duplicates)
          const uniqueLinks = linksData.links.filter((link: AffiliateLink, index: number, self: AffiliateLink[]) =>
            index === self.findIndex((l: AffiliateLink) =>
              l.affiliateId === link.affiliateId &&
              (link.customLink ? l.customLink === link.customLink : !l.customLink)
            )
          );
          setLinks(uniqueLinks);
        }
        if (commissionsData.success) setCommissions(commissionsData.commissions);
        if (visitsData.success) setVisits(visitsData.visits);
      }
    } catch (error) {
      console.error("Error fetching affiliate data:", error);
      toast.error("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!currentUser?.id) {
      toast.error("Vui lòng đăng nhập để đăng ký affiliate");
      return;
    }

    try {
      const res = await fetch("/api/affiliate/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          email: (currentUser as any).email,
          name: currentUser.name || (currentUser as any).username,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "Đăng ký thành công!");
        fetchAffiliateData();
      } else {
        toast.error(data.error || "Đăng ký thất bại");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi đăng ký");
    }
  };

  const handleCreateLink = async () => {
    if (!affiliate) return;

    try {
      const res = await fetch("/api/affiliate/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          affiliateId: affiliate.id,
          customLink: customLink?.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        if (data.message && data.message.includes("đã tồn tại")) {
          toast.info(data.message);
        } else {
          toast.success("Tạo link thành công!");
        }
        setCustomLink("");

        // Always refresh data to get the latest links
        await fetchAffiliateData();
      } else {
        toast.error(data.error || "Tạo link thất bại");
      }
    } catch (error) {
      console.error("Error creating link:", error);
      toast.error("Có lỗi xảy ra khi tạo link");
    }
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success("Đã sao chép link!");
  };

  const handleUpdateSettings = async () => {
    if (!affiliate) return;

    try {
      const res = await fetch("/api/affiliate/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser?.id,
          emailNotifications,
        }),
      });

      if (res.ok) {
        toast.success("Cập nhật cài đặt thành công!");
        fetchAffiliateData();
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật cài đặt");
    }
  };

  // If not registered or pending
  if (!affiliate || affiliate.status === "pending") {
    return (
      <div className="space-y-6">
        <Card>
          <div className="text-center py-8">
            {!affiliate ? (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Trở thành Affiliate
                </h2>
                <p className="text-gray-600 mb-6">
                  Tham gia chương trình affiliate và kiếm hoa hồng khi giới thiệu khách hàng mua khóa học
                </p>
                <Button
                  type="primary"
                  size="large"
                  onClick={handleRegister}
                  loading={loading}
                >
                  Trở thành Affiliate
                </Button>
              </>
            ) : (
              <>
                <CheckCircleOutlined className="text-4xl text-yellow-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Đơn đăng ký của bạn đang chờ duyệt
                </h2>
                <p className="text-gray-600">
                  Vui lòng chờ quản trị viên duyệt đơn đăng ký của bạn. Chúng tôi sẽ thông báo qua email khi đơn được duyệt.
                </p>
              </>
            )}
          </div>
        </Card>
      </div>
    );
  }

  if (affiliate.status === "rejected") {
    return (
      <div className="space-y-6">
        <Card>
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Đơn đăng ký của bạn đã bị từ chối
            </h2>
            <p className="text-gray-600">
              Vui lòng liên hệ admin để biết thêm chi tiết.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const commissionColumns: ColumnsType<Commission> = [
    {
      title: "Mã đơn",
      dataIndex: "orderId",
      key: "orderId",
      render: (orderId: string) => `#${orderId.substring(0, 8)}`,
    },
    {
      title: "Giá trị đơn",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => formatPrice(amount),
    },
    {
      title: "Hoa hồng",
      dataIndex: "commissionAmount",
      key: "commissionAmount",
      render: (amount: number) => (
        <span className="font-bold text-green-600">{formatPrice(amount)}</span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const colors: Record<string, string> = {
          pending: "orange",
          paid: "green",
          cancelled: "red",
        };
        const labels: Record<string, string> = {
          pending: "Chờ thanh toán",
          paid: "Đã thanh toán",
          cancelled: "Đã hủy",
        };
        return <Tag color={colors[status]}>{labels[status]}</Tag>;
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
  ];

  const visitColumns: ColumnsType<Visit> = [
    {
      title: "Link",
      dataIndex: "linkId",
      key: "linkId",
      render: (linkId: string) => `Link ${linkId.substring(0, 8)}`,
    },
    {
      title: "Thời gian",
      dataIndex: "visitedAt",
      key: "visitedAt",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Chuyển đổi",
      dataIndex: "converted",
      key: "converted",
      render: (converted: boolean) => (
        <Tag color={converted ? "green" : "default"}>
          {converted ? "Có" : "Chưa"}
        </Tag>
      ),
    },
    {
      title: "Mã đơn",
      dataIndex: "orderId",
      key: "orderId",
      render: (orderId?: string) => orderId ? `#${orderId.substring(0, 8)}` : "-",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Affiliate Dashboard</h1>
        <p className="text-gray-600">Quản lý chương trình affiliate của bạn</p>
      </div>

      <Tabs defaultActiveKey="overview" size="large">
        {/* Tab Tổng quan */}
        <TabPane
          tab={
            <span className="flex items-center gap-2">
              <DollarOutlined />
              Tổng quan
            </span>
          }
          key="overview"
        >
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <Statistic
                  title="Số dư hiện tại"
                  value={stats.totalBalance}
                  prefix="₫"
                  valueStyle={{ color: "#3f8600" }}
                />
              </Card>
              <Card>
                <Statistic
                  title="Tổng hoa hồng"
                  value={stats.totalCommissions}
                  prefix="₫"
                />
              </Card>
              <Card>
                <Statistic
                  title="Lượt ghé thăm"
                  value={stats.totalVisits}
                  prefix={<EyeOutlined />}
                />
              </Card>
              <Card>
                <Statistic
                  title="Tỷ lệ chuyển đổi"
                  value={stats.conversionRate}
                  suffix="%"
                  precision={2}
                />
              </Card>
            </div>
          )}

          <Card title="Thống kê chi tiết">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-semibold">Hoa hồng chờ thanh toán:</span>
                <span className="text-lg font-bold text-orange-600">
                  {stats ? formatPrice(stats.pendingCommissions) : "0 ₫"}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-semibold">Hoa hồng đã thanh toán:</span>
                <span className="text-lg font-bold text-green-600">
                  {stats ? formatPrice(stats.paidCommissions) : "0 ₫"}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-semibold">Tổng lượt chuyển đổi:</span>
                <span className="text-lg font-bold">
                  {stats?.totalConversions || 0}
                </span>
              </div>
            </div>
          </Card>
        </TabPane>

        {/* Tab Hoa hồng */}
        <TabPane
          tab={
            <span className="flex items-center gap-2">
              <DollarOutlined />
              Hoa hồng
            </span>
          }
          key="commissions"
        >
          <Card>
            <Table
              columns={commissionColumns}
              dataSource={commissions}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        {/* Tab Lượt ghé thăm */}
        <TabPane
          tab={
            <span className="flex items-center gap-2">
              <EyeOutlined />
              Lượt ghé thăm
            </span>
          }
          key="visits"
        >
          <Card>
            <Table
              columns={visitColumns}
              dataSource={visits}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        {/* Tab Trình tạo liên kết */}
        <TabPane
          tab={
            <span className="flex items-center gap-2">
              <LinkOutlined />
              Trình tạo liên kết
            </span>
          }
          key="links"
        >
          <Card title="Tạo link affiliate mới" className="mb-6">
            <Space direction="vertical" className="w-full" size="middle">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link tùy chỉnh (tùy chọn)
                </label>
                <Input
                  placeholder="vd: mylink"
                  value={customLink}
                  onChange={(e) => setCustomLink(e.target.value)}
                  addonBefore="ref="
                />
                <p className="text-xs text-gray-500 mt-1">
                  Nếu để trống, hệ thống sẽ tự động tạo link
                </p>
              </div>
              <Button type="primary" onClick={handleCreateLink}>
                Tạo link
              </Button>
            </Space>
          </Card>

          <Card title="Danh sách link của bạn">
            <div className="space-y-4">
              {links.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    Chưa có link nào. Hãy tạo link đầu tiên của bạn!
                  </p>
                  <Button type="primary" onClick={handleCreateLink}>
                    Tạo link mặc định
                  </Button>
                </div>
              ) : (
                links.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 mb-1">
                        {link.customLink ? `Link tùy chỉnh: ${link.customLink}` : "Link mặc định"}
                      </div>
                      <div className="text-sm text-gray-600 break-all font-mono">
                        {link.link}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Tạo ngày: {dayjs(link.createdAt).format("DD/MM/YYYY HH:mm")}
                      </div>
                    </div>
                    <Button
                      icon={<CopyOutlined />}
                      onClick={() => handleCopyLink(link.link)}
                    >
                      Sao chép
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabPane>

        {/* Tab Cài đặt */}
        <TabPane
          tab={
            <span className="flex items-center gap-2">
              <SettingOutlined />
              Cài đặt
            </span>
          }
          key="settings"
        >
          <Card title="Cài đặt thông báo">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-semibold">Nhận thông báo qua email</div>
                  <div className="text-sm text-gray-600">
                    Nhận thông báo về hoa hồng và thanh toán qua email
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="w-5 h-5"
                />
              </div>
              <Button type="primary" onClick={handleUpdateSettings}>
                Lưu cài đặt
              </Button>
            </div>
          </Card>

          <Card title="Thông tin affiliate" className="mt-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Trạng thái:</span>
                <Tag color="green">Đã duyệt</Tag>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mức hoa hồng:</span>
                <span className="font-bold text-blue-600">{affiliate.commissionRate || 20}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ngày đăng ký:</span>
                <span>{dayjs(affiliate.createdAt).format("DD/MM/YYYY")}</span>
              </div>
              {affiliate.approvedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày duyệt:</span>
                  <span>{dayjs(affiliate.approvedAt).format("DD/MM/YYYY")}</span>
                </div>
              )}
            </div>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

PageAffiliate.Layout = MyProfileLayout;

