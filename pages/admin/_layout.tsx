import { Layout, Menu } from "antd";
import { useRouter } from "next/router";
import {
  DashboardOutlined,
  UserOutlined,
  FormOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
  TagOutlined,
  TeamOutlined,
  SettingOutlined,
  HomeOutlined,
  BookOutlined,
  CreditCardOutlined,
  FileSearchOutlined,
  MenuOutlined,
  GlobalOutlined,
  DollarOutlined,
  LogoutOutlined,
  BarChartOutlined,
  EditOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";

const { Sider, Content } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

const menuItems: MenuItem[] = [
  // ═══════════════════════════════════════
  // MANAGEMENT SECTION
  // ═══════════════════════════════════════
  {
    key: "/admin",
    icon: <DashboardOutlined />,
    label: "Dashboard",
  },
  {
    key: "/admin/users",
    icon: <UserOutlined />,
    label: "Users",
  },
  {
    key: "quizzes-group",
    icon: <FormOutlined />,
    label: "Quizzes",
    children: [
      { key: "/admin/quizzes", label: "Danh sách" },
      { key: "/admin/quizzes/new", label: "Thêm mới" },
    ],
  },
  {
    key: "/admin/test-results",
    icon: <BarChartOutlined />,
    label: "Test Results",
  },
  {
    key: "/admin/orders",
    icon: <ShoppingCartOutlined />,
    label: "Orders",
  },
  {
    key: "/admin/coupons",
    icon: <TagOutlined />,
    label: "Coupons",
  },
  {
    key: "/admin/posts",
    icon: <EditOutlined />,
    label: "Blog Posts",
  },
  {
    key: "/admin/sample-essays",
    icon: <FileSearchOutlined />,
    label: "Sample Essays",
  },
  {
    key: "/admin/affiliate",
    icon: <TeamOutlined />,
    label: "Affiliate",
  },
  {
    key: "/admin/settings",
    icon: <SettingOutlined />,
    label: "Settings",
  },
  {
    type: "divider",
  },
  // ═══════════════════════════════════════
  // CMS CONTENT SECTION
  // ═══════════════════════════════════════
  {
    key: "cms-home",
    icon: <HomeOutlined />,
    label: "CMS: Home",
    children: [
      { key: "/admin/home/banner", label: "Hero Banner" },
      { key: "/admin/home/test-platform-intro", label: "Test Platform Intro" },
      { key: "/admin/home/why-choose-us", label: "Why Choose Us" },
      { key: "/admin/home/testimonials", label: "Testimonials" },
      { key: "/admin/home/practice-section", label: "Practice Section" },
    ],
  },
  {
    key: "cms-exam-library",
    icon: <FileTextOutlined />,
    label: "CMS: Exam Library",
    children: [
      { key: "/admin/ielts-exam-library/hero-banner", label: "Hero Banner" },
    ],
  },
  {
    key: "cms-practice-library",
    icon: <BookOutlined />,
    label: "CMS: Practice Library",
    children: [
      { key: "/admin/ielts-practice-library/banner", label: "Banner" },
    ],
  },
  {
    key: "cms-subscription",
    icon: <CreditCardOutlined />,
    label: "CMS: Subscription",
    children: [
      { key: "/admin/subscription/banner", label: "Banner" },
      { key: "/admin/subscription/course-packages", label: "Course Packages" },
      { key: "/admin/subscription/coupons", label: "Mã giảm giá (Legacy)" },
      { key: "/admin/subscription/faq", label: "FAQ" },
    ],
  },
  {
    key: "cms-sample-essay",
    icon: <FileSearchOutlined />,
    label: "CMS: Sample Essay",
    children: [
      { key: "/admin/sample-essay/banner", label: "Banner" },
    ],
  },
  {
    key: "cms-header",
    icon: <MenuOutlined />,
    label: "CMS: Header",
    children: [
      { key: "/admin/header/top-bar", label: "Top Bar" },
    ],
  },
  {
    key: "cms-footer",
    icon: <GlobalOutlined />,
    label: "CMS: Footer",
    children: [
      { key: "/admin/footer/cta-banner", label: "CTA Banner" },
    ],
  },
  {
    key: "cms-account",
    icon: <UserOutlined />,
    label: "CMS: Account Pages",
    children: [
      { key: "/admin/account/login", label: "Login Page" },
      { key: "/admin/account/register", label: "Register Page" },
    ],
  },
  {
    key: "cms-legal",
    icon: <FileTextOutlined />,
    label: "CMS: Legal Pages",
    children: [
      { key: "/admin/terms-of-use", label: "Terms of Service" },
      { key: "/admin/privacy-policy", label: "Privacy Policy" },
    ],
  },
];

// Top-level direct links (no children)
const DIRECT_LINKS = new Set([
  "/admin",
  "/admin/users",
  "/admin/test-results",
  "/admin/orders",
  "/admin/coupons",
  "/admin/posts",
  "/admin/sample-essays",
  "/admin/affiliate",
  "/admin/settings",
]);

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    if (e.key && typeof e.key === "string") {
      if (e.key.startsWith("/")) {
        router.push(e.key);
      } else if (e.key.startsWith("http")) {
        window.location.href = e.key;
      }
    }
  };

  const getSelectedKeys = () => {
    const path = router.asPath;

    // Direct link match
    if (DIRECT_LINKS.has(path)) return [path];

    // Check for prefix match (e.g. /admin/users/123 → /admin/users)
    for (const link of DIRECT_LINKS) {
      if (link !== "/admin" && path.startsWith(link + "/")) return [link];
    }

    // Nested menu match (quizzes group, CMS sections)
    for (const item of menuItems) {
      if (item && "children" in item && item.children) {
        for (const child of item.children) {
          if (child?.key === path) return [path];
          // Prefix match for nested (e.g. /admin/quizzes/123)
          if (child?.key && typeof child.key === "string" && child.key.startsWith("/") && path.startsWith(child.key + "/")) {
            return [child.key];
          }
        }
      }
    }

    return ["/admin"];
  };

  const getOpenKeys = () => {
    const path = router.asPath;

    // Check nested menus
    for (const item of menuItems) {
      if (item && "children" in item && item.children) {
        for (const child of item.children) {
          if (child?.key === path) return [item.key as string];
          if (child?.key && typeof child.key === "string" && path.startsWith(child.key as string)) {
            return [item.key as string];
          }
        }
      }
    }

    return [];
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        width={260}
        theme="light"
        style={{
          overflow: "hidden",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            height: 64,
            margin: "0 16px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 12px",
            fontWeight: "bold",
            fontSize: 20,
            color: "#d94a56",
            borderBottom: "2px solid #f0f0f0",
            transition: "all 0.2s",
            flexShrink: 0,
          }}
        >
          <span style={{ letterSpacing: "0.5px" }}>Admin Panel</span>
        </div>
        <div
          className="admin-sidebar-menu-container"
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            paddingBottom: 16,
            minHeight: 0,
            maxHeight: "calc(100vh - 88px)",
            height: "calc(100vh - 88px)",
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={getSelectedKeys()}
            defaultOpenKeys={getOpenKeys()}
            items={menuItems}
            onClick={handleMenuClick}
            style={{
              borderRight: 0,
              padding: "8px 0",
            }}
            theme="light"
          />
        </div>
      </Sider>
      <Layout
        style={{
          marginLeft: 260,
        }}
      >
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          {children}
        </Content>
      </Layout>

      <style jsx global>{`
        /* Custom styles for Admin Menu */
        .ant-menu-item {
          margin: 4px 8px !important;
          border-radius: 6px !important;
          height: 40px !important;
          line-height: 40px !important;
          transition: all 0.2s !important;
        }

        .ant-menu-item-selected {
          background-color: #e6f7ff !important;
          color: #1890ff !important;
          font-weight: 500 !important;
        }

        .ant-menu-item-selected::after {
          display: none !important;
        }

        .ant-menu-item:hover {
          background-color: #f5f5f5 !important;
          color: #1890ff !important;
        }

        .ant-menu-submenu-title {
          margin: 4px 8px !important;
          border-radius: 6px !important;
          height: 40px !important;
          line-height: 40px !important;
          transition: all 0.2s !important;
        }

        .ant-menu-submenu-title:hover {
          background-color: #f5f5f5 !important;
          color: #1890ff !important;
        }

        .ant-menu-submenu-selected > .ant-menu-submenu-title {
          color: #1890ff !important;
          font-weight: 500 !important;
        }

        .ant-menu-submenu-open > .ant-menu-submenu-title {
          color: #1890ff !important;
        }

        .ant-menu-submenu-arrow {
          color: #666 !important;
          transition: all 0.3s !important;
        }

        .ant-menu-submenu-open
          > .ant-menu-submenu-title
          .ant-menu-submenu-arrow {
          color: #1890ff !important;
        }

        .ant-menu-submenu-inline
          .ant-menu-submenu-title
          .ant-menu-submenu-arrow {
          right: 16px !important;
        }

        .ant-menu-inline .ant-menu-sub .ant-menu-item {
          padding-left: 48px !important;
        }

        .ant-menu-inline .ant-menu-item::before {
          display: none !important;
        }

        .ant-menu-item-icon {
          font-size: 16px !important;
          margin-right: 12px !important;
        }

        .ant-menu-submenu-title .ant-menu-item-icon {
          margin-right: 0px !important;
        }

        .ant-layout-sider-trigger {
          background: #fafafa !important;
          border-top: 1px solid #f0f0f0 !important;
        }

        .ant-layout-sider-trigger:hover {
          background: #f0f0f0 !important;
        }

        /* Custom scrollbar for menu container */
        .admin-sidebar-menu-container::-webkit-scrollbar {
          width: 8px;
        }

        .admin-sidebar-menu-container::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
          margin: 8px 0;
        }

        .admin-sidebar-menu-container::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
        }

        .admin-sidebar-menu-container::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        /* Firefox scrollbar */
        .admin-sidebar-menu-container {
          scrollbar-width: thin;
          scrollbar-color: #c1c1c1 #f1f1f1;
        }

        /* Ensure menu items are clickable */
        .ant-menu {
          padding-bottom: 16px !important;
        }
      `}</style>
    </Layout>
  );
}
