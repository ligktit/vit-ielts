import React from "react";
import { Container } from "@/shared/ui";
import { Footer, Header } from "../base/ui";
import { Navigation } from "./ui";
import { ROUTES } from "@/shared/routes";
import { useRouter } from "next/router";
import { ComparePlans } from "@/widgets";
import { Breadcrumb } from "antd";
import Link from "next/link";

export const MyProfileLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const ACCOUNT_NAVIGATION = [
    {
      label: "My Dashboard",
      icon: "home",
      link: ROUTES.ACCOUNT.DASHBOARD,
    },
    {
      label: "My Profile",
      icon: "person",
      link: ROUTES.ACCOUNT.MY_PROFILE,
    },
    {
      label: "Order History",
      icon: "shopping_cart",
      link: ROUTES.ACCOUNT.ORDER_HISTORY,
    },
    {
      label: "Affiliate",
      icon: "link",
      link: ROUTES.ACCOUNT.AFFILIATE,
    },
    {
      label: "Checkout",
      icon: "payment",
      link: ROUTES.CHECKOUT,
    },
    {
      type: "divider",
    },
    {
      label: "Logout",
      icon: "logout",
      link: "#",
      danger: true,
    },
  ];

  const getBannerConfig = () => {
    const pathname = router.pathname;
    const configs: Record<string, { title: string; breadcrumb: Array<{ title: React.ReactNode }> }> = {
      [ROUTES.ACCOUNT.DASHBOARD]: {
        title: "My Dashboard",
        breadcrumb: [
          { title: <Link href={ROUTES.HOME}>Home</Link> },
          { title: "My Dashboard" },
        ],
      },
      [ROUTES.ACCOUNT.MY_PROFILE]: {
        title: "My Profile",
        breadcrumb: [
          { title: <Link href={ROUTES.HOME}>Home</Link> },
          { title: <Link href={ROUTES.ACCOUNT.DASHBOARD}>My Account</Link> },
          { title: "My Profile" },
        ],
      },
      [ROUTES.ACCOUNT.ORDER_HISTORY]: {
        title: "Order History",
        breadcrumb: [
          { title: <Link href={ROUTES.HOME}>Home</Link> },
          { title: <Link href={ROUTES.ACCOUNT.DASHBOARD}>My Account</Link> },
          { title: "Order History" },
        ],
      },
      [ROUTES.ACCOUNT.AFFILIATE]: {
        title: "Affiliate",
        breadcrumb: [
          { title: <Link href={ROUTES.HOME}>Home</Link> },
          { title: <Link href={ROUTES.ACCOUNT.DASHBOARD}>My Account</Link> },
          { title: "Affiliate" },
        ],
      },
      [ROUTES.CHECKOUT]: {
        title: "Checkout",
        breadcrumb: [
          { title: <Link href={ROUTES.HOME}>Home</Link> },
          { title: <Link href={ROUTES.ACCOUNT.DASHBOARD}>My Account</Link> },
          { title: "Checkout" },
        ],
      },
    };
    return configs[pathname];
  };

  const bannerConfig = getBannerConfig();
  const shouldShowBanner = !!bannerConfig;

  return (
    <>
      <Header />
      {shouldShowBanner && bannerConfig && (
        <div
          className="py-10 md:py-12 w-full"
          style={{
            background:
              "linear-gradient(rgb(255, 255, 255) 0%, rgb(239, 241, 255) 100%)",
          }}
        >
          <Container>
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {bannerConfig.title}
              </h1>
              <div className="flex justify-center">
                <Breadcrumb items={bannerConfig.breadcrumb} />
              </div>
            </div>
          </Container>
        </div>
      )}
      <Container>
        <div className="py-8">
          <div className="flex flex-wrap -m-4">
            <div className="w-full md:w-4/12 p-4 space-y-4">
              <Navigation navigation={ACCOUNT_NAVIGATION} />
              <ComparePlans />
            </div>
            <div className="w-full md:w-8/12 p-4">
              {children}
            </div>
          </div>
        </div>
      </Container>
      <Footer />
    </>
  );
};
