"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/appx/providers/auth-provider";
import { MyProfileLayout } from "@/widgets/layouts";
import { toast } from "react-toastify";
import {
  Tabs, Card, Button, Input, Table, Tag, Statistic, Space, Modal,
  InputNumber, Form, Descriptions, message, Alert, Empty,
} from "antd";
import {
  DollarOutlined,
  EyeOutlined,
  LinkOutlined,
  CheckCircleOutlined,
  CopyOutlined,
  SettingOutlined,
  BankOutlined,
  WalletOutlined,
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
  commission_rate?: number;
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
  status: "pending" | "approved" | "paid" | "cancelled" | "review";
  fraudFlag?: string;
  eligibleAt?: string;
  createdAt: string;
}

interface Visit {
  id: string;
  linkId: string;
  visitedAt: string;
  converted: boolean;
  orderId?: string;
}

interface Payout {
  id: string;
  amount: number;
  status: string;
  reject_reason: string | null;
  bank_snapshot: Record<string, string>;
  created_at: string;
  completed_at: string | null;
}

interface BankInfo {
  account_holder: string;
  account_number: string;
  bank_name: string;
  bank_code?: string;
  bank_branch?: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "orange" },
  approved: { label: "Approved", color: "blue" },
  completed: { label: "Completed", color: "green" },
  rejected: { label: "Rejected", color: "red" },
  flagged: { label: "Needs review", color: "volcano" },
};

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

  // Payout state
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [balance, setBalance] = useState(0);
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);
  const [showBankForm, setShowBankForm] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState(0);
  const [bankForm] = Form.useForm();
  const [payoutLoading, setPayoutLoading] = useState(false);

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

        // Fetch all data concurrently
        const [statsRes, linksRes, commissionsRes, visitsRes, bankRes, payoutsRes] =
          await Promise.all([
            fetch(`/api/affiliate/stats?affiliateId=${affiliateData.affiliate.id}`),
            fetch(`/api/affiliate/links?affiliateId=${affiliateData.affiliate.id}`),
            fetch(`/api/affiliate/commissions?affiliateId=${affiliateData.affiliate.id}`),
            fetch(`/api/affiliate/visits?affiliateId=${affiliateData.affiliate.id}`),
            fetch("/api/affiliate/bank-info"),
            fetch("/api/affiliate/payouts"),
          ]);

        const [statsData, linksData, commissionsData, visitsData, bankData, payoutsData] =
          await Promise.all([
            statsRes.json(),
            linksRes.json(),
            commissionsRes.json(),
            visitsRes.json(),
            bankRes.json(),
            payoutsRes.json(),
          ]);

        if (statsData.success) setStats(statsData.stats);
        if (linksData.success) {
          const uniqueLinks = linksData.links.filter(
            (link: AffiliateLink, index: number, self: AffiliateLink[]) =>
              index ===
              self.findIndex(
                (l: AffiliateLink) =>
                  l.affiliateId === link.affiliateId &&
                  (link.customLink ? l.customLink === link.customLink : !l.customLink),
              ),
          );
          setLinks(uniqueLinks);
        }
        if (commissionsData.success) setCommissions(commissionsData.commissions);
        if (visitsData.success) setVisits(visitsData.visits);
        if (bankData.success && bankData.bankInfo) {
          setBankInfo(bankData.bankInfo);
          bankForm.setFieldsValue({
            accountHolder: bankData.bankInfo.account_holder,
            accountNumber: bankData.bankInfo.account_number,
            bankName: bankData.bankInfo.bank_name,
            bankCode: bankData.bankInfo.bank_code || "",
            bankBranch: bankData.bankInfo.bank_branch || "",
          });
        }
        if (payoutsData.success) {
          setPayouts(payoutsData.payouts || []);
        }

        // Fetch balance
        const dashRes = await fetch("/api/affiliate/dashboard");
        const dashData = await dashRes.json();
        if (dashData.success) {
          setBalance(dashData.dashboard?.balance ?? 0);
        }
      }
    } catch (error) {
      console.error("Error fetching affiliate data:", error);
      toast.error("An error occurred while loading data");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!currentUser?.id) {
      toast.error("Please sign in to register as an affiliate");
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
        toast.success(data.message || "Registration successful!");
        fetchAffiliateData();
      } else {
        toast.error(data.error || "Registration failed");
      }
    } catch (error) {
      toast.error("An error occurred during registration");
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
          toast.success("Link created successfully!");
        }
        setCustomLink("");
        await fetchAffiliateData();
      } else {
        toast.error(data.error || "Failed to create link");
      }
    } catch (error) {
      console.error("Error creating link:", error);
      toast.error("An error occurred while creating the link");
    }
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success("Link copied!");
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
        toast.success("Settings updated successfully!");
        fetchAffiliateData();
      }
    } catch (error) {
      toast.error("An error occurred while updating settings");
    }
  };

  // ──── Bank Info ────
  const handleSaveBankInfo = async (values: Record<string, string>) => {
    try {
      const res = await fetch("/api/affiliate/bank-info", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (data.success) {
        setBankInfo(data.bankInfo);
        setShowBankForm(false);
        toast.success("Bank details saved");
      } else {
        toast.error(data.error || "Failed to save");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  // ──── Payout Request ────
  const handleRequestPayout = async () => {
    if (!payoutAmount || payoutAmount <= 0) {
      toast.error("Please enter a withdrawal amount");
      return;
    }
    if (!bankInfo) {
      toast.error("Please update your bank details first");
      return;
    }

    setPayoutLoading(true);
    try {
      const res = await fetch("/api/affiliate/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: payoutAmount }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Withdrawal request submitted successfully!");
        setShowPayoutModal(false);
        setPayoutAmount(0);
        fetchAffiliateData();
      } else {
        toast.error(data.error || "Failed to submit request");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setPayoutLoading(false);
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
                  Become an Affiliate
                </h2>
                <p className="text-gray-600 mb-6">
                  Join the affiliate programme and earn commission by referring new customers.
                </p>
                <Button type="primary" size="large" onClick={handleRegister} loading={loading}>
                  Become an Affiliate
                </Button>
              </>
            ) : (
              <>
                <CheckCircleOutlined className="text-4xl text-yellow-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Your application is pending review
                </h2>
                <p className="text-gray-600">
                  Please wait for an administrator to review your application.
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
              Your application has been rejected
            </h2>
            <p className="text-gray-600">Please contact an admin for more details.</p>
          </div>
        </Card>
      </div>
    );
  }

  const commissionColumns: ColumnsType<Commission> = [
    {
      title: "Order ID",
      dataIndex: "order_id",
      key: "order_id",
      render: (orderId?: string) => orderId ? `#${orderId.substring(0, 8)}` : "-",
    },
    {
      title: "Order value",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => formatPrice(amount || 0),
    },
    {
      title: "Commission",
      dataIndex: "commission_amount",
      key: "commission_amount",
      render: (amount: number) => (
        <span className="font-bold text-green-600">{formatPrice(amount)}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string, record: Commission) => {
        const colors: Record<string, string> = {
          pending: "orange",
          approved: "blue",
          paid: "green",
          cancelled: "red",
          review: "volcano",
        };
        const labels: Record<string, string> = {
          pending: "Pending",
          approved: "Approved",
          paid: "Paid",
          cancelled: "Cancelled",
          review: "Under review",
        };

        return (
          <Space direction="vertical" size={0}>
            <Tag color={colors[status]}>{labels[status] || status}</Tag>
            {status === "pending" && record.eligible_at && (
              <span className="text-xs text-gray-400">
                Eligible: {dayjs(record.eligible_at).format("DD/MM/YYYY")}
              </span>
            )}
          </Space>
        );
      },
    },
    {
      title: "Created",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
  ];

  const visitColumns: ColumnsType<Visit> = [
    {
      title: "Link",
      dataIndex: "link_id",
      key: "link_id",
      render: (linkId?: string) => {
        if (!linkId) return "-";
        const matchedLink = links.find((l) => l.id === linkId);
        if (matchedLink) {
          return matchedLink.customLink ? (
            <Tag color="processing">ref={matchedLink.customLink}</Tag>
          ) : (
            <Tag color="default">Default</Tag>
          );
        }
        return `Link ${linkId.substring(0, 8)}`;
      },
    },
    {
      title: "Time",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Converted",
      dataIndex: "converted",
      key: "converted",
      render: (converted: boolean) => (
        <Tag color={converted ? "green" : "default"}>{converted ? "Yes" : "No"}</Tag>
      ),
    },
    {
      title: "Order ID",
      dataIndex: "order_id",
      key: "order_id",
      render: (orderId?: string) => (orderId ? `#${orderId.substring(0, 8)}` : "-"),
    },
  ];

  const payoutColumns: ColumnsType<Payout> = [
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => (
        <span className="font-bold text-green-600">{formatPrice(amount)}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const cfg = STATUS_LABELS[status] || { label: status, color: "default" };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: "Rejection reason",
      dataIndex: "reject_reason",
      key: "reject_reason",
      render: (reason: string | null) =>
        reason ? <span className="text-red-500 text-sm">{reason}</span> : "-",
    },
    {
      title: "Created",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Completed",
      dataIndex: "completed_at",
      key: "completed_at",
      render: (date: string | null) =>
        date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "-",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Affiliate Dashboard</h1>
        <p className="text-gray-600">Manage your affiliate programme</p>
      </div>

      <Tabs defaultActiveKey="overview" size="large">
        {/* Tab Overview */}
        <TabPane
          tab={
            <span className="flex items-center gap-2">
              <DollarOutlined />
              Overview
            </span>
          }
          key="overview"
        >
          {/* Balance + Payout Card */}
          <Card className="mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Current balance</div>
                <div className="text-3xl font-bold text-green-600">
                  {formatPrice(balance)}
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  type="primary"
                  icon={<WalletOutlined />}
                  size="large"
                  onClick={() => {
                    if (!bankInfo) {
                      toast.warning("Please update your bank details first");
                      return;
                    }
                    setPayoutAmount(balance);
                    setShowPayoutModal(true);
                  }}
                  disabled={balance < 200000}
                >
                  Withdraw
                </Button>
                <Button
                  icon={<BankOutlined />}
                  size="large"
                  onClick={() => setShowBankForm(true)}
                >
                  {bankInfo ? "Edit bank details" : "Add bank details"}
                </Button>
              </div>
            </div>
          </Card>

          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <Card>
                <Statistic
                  title="Commission rate"
                  value={affiliate?.commission_rate !== undefined ? affiliate.commission_rate * 100 : 20}
                  suffix="%"
                />
              </Card>
              <Card>
                <Statistic
                  title="Total commissions"
                  value={stats.totalCommissions}
                  prefix="₫"
                />
              </Card>
              <Card>
                <Statistic
                  title="Total visits"
                  value={stats.totalVisits}
                  prefix={<EyeOutlined />}
                />
              </Card>
              <Card>
                <Statistic
                  title="Conversion rate"
                  value={stats.conversionRate}
                  suffix="%"
                  precision={2}
                />
              </Card>
              <Card>
                <Statistic
                  title="Successful conversions"
                  value={stats.totalConversions}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </div>
          )}

          <Card title="Detailed stats">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-semibold">Pending commissions:</span>
                <span className="text-lg font-bold text-orange-600">
                  {stats ? formatPrice(stats.pendingCommissions) : "0 ₫"}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-semibold">Paid commissions:</span>
                <span className="text-lg font-bold text-green-600">
                  {stats ? formatPrice(stats.paidCommissions) : "0 ₫"}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-semibold">Total conversions:</span>
                <span className="text-lg font-bold">{stats?.totalConversions || 0}</span>
              </div>
            </div>
          </Card>
        </TabPane>

        {/* Tab Commissions */}
        <TabPane
          tab={
            <span className="flex items-center gap-2">
              <DollarOutlined />
              Commissions
            </span>
          }
          key="commissions"
        >
          <Card>
            <Alert
              message="Commissions have a 7-day holding period before being credited to your balance"
              type="info"
              showIcon
              className="mb-4"
            />
            <Table
              columns={commissionColumns}
              dataSource={commissions}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        {/* Tab Withdrawals */}
        <TabPane
          tab={
            <span className="flex items-center gap-2">
              <WalletOutlined />
              Withdrawals
            </span>
          }
          key="payouts"
        >
          <Card>
            {payouts.length > 0 ? (
              <Table
                columns={payoutColumns}
                dataSource={payouts}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            ) : (
              <Empty description="No withdrawal requests yet" />
            )}
          </Card>
        </TabPane>

        {/* Tab Visits */}
        <TabPane
          tab={
            <span className="flex items-center gap-2">
              <EyeOutlined />
              Visits
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

        {/* Tab Link builder */}
        <TabPane
          tab={
            <span className="flex items-center gap-2">
              <LinkOutlined />
              Link builder
            </span>
          }
          key="links"
        >
          <Card title="Create new affiliate link" className="mb-6">
            <Space direction="vertical" className="w-full" size="middle">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom link (optional)
                </label>
                <Input
                  placeholder="e.g. mylink"
                  value={customLink}
                  onChange={(e) => setCustomLink(e.target.value)}
                  addonBefore="ref="
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank to have the system generate a link automatically.
                </p>
              </div>
              <Button type="primary" onClick={handleCreateLink}>
                Create link
              </Button>
            </Space>
          </Card>

          <Card title="Your links">
            <div className="space-y-4">
              {links.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    No links yet. Create your first one!
                  </p>
                  <Button type="primary" onClick={handleCreateLink}>
                    Create default link
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
                        {link.customLink ? `Custom link: ${link.customLink}` : "Default link"}
                      </div>
                      <div className="text-sm text-gray-600 break-all font-mono">{link.link}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Created: {dayjs(link.createdAt).format("DD/MM/YYYY HH:mm")}
                      </div>
                    </div>
                    <Button icon={<CopyOutlined />} onClick={() => handleCopyLink(link.link)}>
                      Copy
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabPane>

        {/* Tab Settings */}
        <TabPane
          tab={
            <span className="flex items-center gap-2">
              <SettingOutlined />
              Settings
            </span>
          }
          key="settings"
        >
          {/* Bank Info */}
          <Card title="🏦 Bank details" className="mb-6">
            {bankInfo ? (
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="Account holder">
                  {bankInfo.account_holder}
                </Descriptions.Item>
                <Descriptions.Item label="Account number">
                  {bankInfo.account_number}
                </Descriptions.Item>
                <Descriptions.Item label="Bank">
                  {bankInfo.bank_name}
                </Descriptions.Item>
                {bankInfo.bank_branch && (
                  <Descriptions.Item label="Branch">
                    {bankInfo.bank_branch}
                  </Descriptions.Item>
                )}
              </Descriptions>
            ) : (
              <Alert
                message="No bank details on file"
                description="Please add your bank details to be able to withdraw funds."
                type="warning"
                showIcon
              />
            )}
            <Button
              type="primary"
              className="mt-4"
              icon={<BankOutlined />}
              onClick={() => setShowBankForm(true)}
            >
              {bankInfo ? "Update details" : "Add bank details"}
            </Button>
          </Card>

          {/* Notification Settings */}
          <Card title="Notification settings">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-semibold">Email notifications</div>
                  <div className="text-sm text-gray-600">
                    Receive commission and payment updates via email
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
                Save settings
              </Button>
            </div>
          </Card>

          {/* Affiliate Info */}
          <Card title="Affiliate info" className="mt-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <Tag color="green">Approved</Tag>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Commission rate:</span>
                <span className="font-bold text-blue-600">
                  {affiliate?.commission_rate !== undefined ? affiliate.commission_rate * 100 : 20}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Registered:</span>
                <span>{dayjs(affiliate.createdAt).format("DD/MM/YYYY")}</span>
              </div>
              {affiliate.approvedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Approved:</span>
                  <span>{dayjs(affiliate.approvedAt).format("DD/MM/YYYY")}</span>
                </div>
              )}
            </div>
          </Card>
        </TabPane>
      </Tabs>

      {/* ═══ BANK INFO MODAL ═══ */}
      <Modal
        title="Bank details"
        open={showBankForm}
        onCancel={() => setShowBankForm(false)}
        footer={null}
      >
        <Form form={bankForm} layout="vertical" onFinish={handleSaveBankInfo}>
          <Form.Item
            name="accountHolder"
            label="Account holder"
            rules={[{ required: true, message: "Required" }]}
          >
            <Input placeholder="NGUYEN VAN A" />
          </Form.Item>
          <Form.Item
            name="accountNumber"
            label="Account number"
            rules={[{ required: true, message: "Required" }]}
          >
            <Input placeholder="1234567890" />
          </Form.Item>
          <Form.Item
            name="bankName"
            label="Bank name"
            rules={[{ required: true, message: "Required" }]}
          >
            <Input placeholder="Vietcombank" />
          </Form.Item>
          <Form.Item name="bankCode" label="Bank code (for VietQR)">
            <Input placeholder="VCB" />
          </Form.Item>
          <Form.Item name="bankBranch" label="Branch">
            <Input placeholder="Ho Chi Minh City" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            Save details
          </Button>
        </Form>
      </Modal>

      {/* ═══ PAYOUT REQUEST MODAL ═══ */}
      <Modal
        title="Withdrawal request"
        open={showPayoutModal}
        onCancel={() => {
          setShowPayoutModal(false);
          setPayoutAmount(0);
        }}
        footer={[
          <Button key="cancel" onClick={() => setShowPayoutModal(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={payoutLoading}
            onClick={handleRequestPayout}
          >
            Submit request
          </Button>,
        ]}
      >
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
            <div className="text-sm text-gray-500">Available balance</div>
            <div className="text-2xl font-bold text-green-600">{formatPrice(balance)}</div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Withdrawal amount (VND)</label>
            <InputNumber
              value={payoutAmount}
              onChange={(v) => setPayoutAmount(v || 0)}
              min={200000}
              max={balance}
              step={10000}
              style={{ width: "100%" }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, ""))}
              addonAfter="VND"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum 200,000 VND</p>
          </div>

          {bankInfo && (
            <div className="p-3 bg-gray-50 rounded-lg text-sm">
              <div className="font-semibold mb-1">Transfer to:</div>
              <div>
                {bankInfo.bank_name} — {bankInfo.account_number}
              </div>
              <div className="text-gray-500">{bankInfo.account_holder}</div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

PageAffiliate.Layout = MyProfileLayout;
