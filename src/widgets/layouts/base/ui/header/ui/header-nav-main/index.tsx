import Link from "next/link";
import { useMemo, useState } from "react";
import { ConfigProvider, Dropdown } from "antd";
import { createStyles } from "antd-style";
import { ROUTES } from "@/shared/routes";
import { MasterData, useAppContext } from "@/appx/providers";

const useStyle = createStyles(({ css }) => ({
  headerNavMenu: css`
    .ant-dropdown-menu,
    &.ant-dropdown-menu {
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1;
      background-color: white;
      padding: 8px 0;
      min-width: 200px;
      border: 1px solid #e5e7eb;

      .ant-dropdown-menu-item {
        color: #374151 !important;
        font-weight: 400;
        padding: 10px 16px;
        line-height: 1.5;
        border-radius: 0;
        transition: all 0.2s;

        &:hover {
          background-color: #f3f4f6 !important;
          color: #2563eb !important;
        }
      }

      .ant-dropdown-menu-submenu-title,
      .ant-dropdown-menu-submenu-expand-icon
        .ant-dropdown-menu-submenu-arrow-icon {
        color: #374151 !important;
        font-weight: 400;
        padding: 10px 16px;
        line-height: 1.5;
        border-radius: 0;
      }
    }

    .ant-dropdown-menu-item-active {
      background-color: #f3f4f6 !important;
      color: #2563eb !important;
    }
  `,
}));

function createModifiedMenuData(
  menu: MasterData["menuData"][string] | undefined,
  modifyFn: (
    item: MasterData["menuData"][string][number]
  ) => string | React.ReactNode
): MasterData["menuData"][string] {
  if (!menu) return [];
  const newMenuData = menu.map((item) => {
    return {
      ...item,
      label: modifyFn(item),
      children: item.children
        ? createModifiedMenuData(item.children, modifyFn)
        : undefined,
    };
  });

  return newMenuData;
}

export const HeaderNavMain = () => {
  const { styles } = useStyle();
  const { masterData } = useAppContext();
  const [openDropdowns, setOpenDropdowns] = useState<Record<number, boolean>>(
    {}
  );

  const menuDataMapped = useMemo(() => {
    if (!masterData?.menuData["main-menu"]) return [];
    const menuData = masterData.menuData;

    const cmsMenuItems = menuData["main-menu"].map((item) => {
      // Đảm bảo item "Home" luôn trỏ về trang chủ
      const labelStr =
        typeof item.label === "string" ? item.label.toLowerCase() : "";
      const isHome =
        labelStr === "home" || item.uri === "/" || item.uri === ROUTES.HOME;
      const uri = isHome ? ROUTES.HOME : item.uri || "#";

      return {
        ...item,
        uri,
        children: createModifiedMenuData(item.children, (item) => (
          <Link href={item.uri || "#"}>{item.label}</Link>
        )),
      };
    });

    // Add subscription link to the menu
    const subscriptionMenuItem = {
      key: "subscription",
      label: "Subscription",
      uri: ROUTES.SUBSCRIPTION,
      children: undefined,
    };

    return [...cmsMenuItems, subscriptionMenuItem];
  }, [masterData?.menuData]);

  return (
    <ConfigProvider>
      <ul className="flex items-stretch h-full">
        {menuDataMapped.map((menu, index) => (
          <li key={index}>
            {menu.children && menu.children.length > 0 ? (
              <Dropdown
                menu={{
                  items: menu.children,
                  rootClassName: styles.headerNavMenu,
                }}
                align={{ offset: [0, 0] }}
                onOpenChange={(open) => {
                  setOpenDropdowns((prev) => ({
                    ...prev,
                    [index]: open,
                  }));
                }}
                open={openDropdowns[index]}
                trigger={["hover"]}
              >
                <Link
                  className={`px-2.5 flex font-semibold items-center justify-center h-full transition-all duration-150 hover:bg-gray-100 ${
                    openDropdowns[index] ? "text-[#2563eb]" : "text-gray-700"
                  }`}
                  href={menu.uri || "#"}
                  style={{ lineHeight: "50px" }}
                >
                  <span>{menu.label}</span>
                  {menu.children.length > 0 && (
                    <i
                      className={`material-symbols-rounded ml-2 text-sm transition-transform ${
                        openDropdowns[index] ? "rotate-180" : ""
                      }`}
                    >
                      keyboard_arrow_down
                    </i>
                  )}
                </Link>
              </Dropdown>
            ) : (
              <Link
                className="px-2.5 flex font-semibold items-center justify-center h-full transition-all duration-150 text-gray-700 hover:bg-gray-100"
                href={menu.uri || "#"}
                style={{ lineHeight: "50px" }}
              >
                <span>{menu.label}</span>
              </Link>
            )}
          </li>
        ))}
      </ul>
    </ConfigProvider>
  );
};
