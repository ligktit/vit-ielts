import type { AppProps } from "next/app";
import { BaseLayout, BlankLayout } from "@/widgets/layouts";
import { ProgressProvider } from "@bprogress/next/pages";
import { ConfigProvider } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { NextComponentType } from "next";
import { AppProvider, AuthProvider } from "./providers";
import { Bounce, ToastContainer } from "react-toastify";
import { StyleProvider } from "@ant-design/cssinjs";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo } from "react";
import { BProgress } from "@bprogress/core";


dayjs.locale("vi");
import dynamic from "next/dynamic";

const AffiliateTracker = dynamic(
  () => import("@/widgets/affiliate-tracker").then((mod) => mod.default),
  { ssr: false }
);

import { unstableSetRender } from "antd";
import { createRoot } from "react-dom/client";
import { ProContentModal } from "@/shared/ui/pro-content";
import { MaintenancePage } from "./maintenance";

const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";

export default function App({
  Component,
  pageProps,
}: AppProps & {
  Component: NextComponentType & { Layout?: NextComponentType };
}) {
  if (isMaintenanceMode) {
    return (
      <ProgressProvider
        color="oklch(60.987% 0.17833 19.421)"
        options={{ showSpinner: false }}
        shallowRouting
      >
        <StyleProvider layer>
          <ConfigProvider
            card={{ className: "shadow-primary border-none" }}
            theme={{
              token: {
                colorPrimary: "#d94a56",
                fontFamily: "inherit, sans-serif",
                colorLink: "#d94a56",
              },
              components: {
                Input: {
                  fontSizeLG: 14,
                },
              },
            }}
          >
            <BlankLayout>
              <MaintenancePage />
            </BlankLayout>
          </ConfigProvider>
        </StyleProvider>
      </ProgressProvider>
    );
  }

  const Layout = pageProps.masterData
    ? Component.Layout || BaseLayout
    : BlankLayout;

  const router = useRouter();

  useEffect(() => {
    const start = () => BProgress.start();
    const stop = () => BProgress.done();

    // Listen to route change events
    router.events.on("routeChangeStart", start);
    router.events.on("routeChangeComplete", stop);
    router.events.on("routeChangeError", stop);

    // Clean up event listeners
    return () => {
      router.events.off("routeChangeStart", start);
      router.events.off("routeChangeComplete", stop);
      router.events.off("routeChangeError", stop);
    };
  }, [router.events]);

  useEffect(() => {
    unstableSetRender((node, container) => {
      const root = createRoot(container);
      root.render(node);
      return async () => {
        root.unmount();
      };
    });
  }, []);

  const ChildrenComponent = useMemo(
    () => (
      <StyleProvider layer>
        <ConfigProvider
          card={{ className: "shadow-primary border-none" }}
          theme={{
            token: {
              colorPrimary: "#d94a56",
              fontFamily: "inherit, sans-serif",
              // fontSizeLG: 14,
              colorLink: "#d94a56",
            },
            components: {
              Input: {
                fontSizeLG: 14,
              },
            },
          }}
          select={{
            className: "min-w-32",
          }}
        >
          <Layout>
            <Head>
              <title>
                {pageProps.masterData?.allSettings.generalSettingsTitle || ""}
              </title>
              <link rel="icon" href="/favicon.ico" />
              <link
                rel="apple-touch-icon"
                sizes="180x180"
                href="/apple-touch-icon.png"
              />
              <link
                rel="icon"
                type="image/png"
                sizes="32x32"
                href="/favicon-32x32.png"
              />
              <link
                rel="icon"
                type="image/png"
                sizes="16x16"
                href="/favicon-16x16.png"
              />
              <link rel="manifest" href="/site.webmanifest" />
            </Head>
            <AffiliateTracker />
            <Component {...pageProps} />
            <ToastContainer
              position="top-right"
              autoClose={2000}
              hideProgressBar
              newestOnTop={false}
              closeOnClick={false}
              rtl={false}
              pauseOnFocusLoss
              draggable={false}
              pauseOnHover={false}
              theme="light"
              transition={Bounce}
            />
            <ProContentModal />
          </Layout>
        </ConfigProvider>
      </StyleProvider>
    ),
    [Component, Layout, pageProps]
  );

  return (
    <ProgressProvider
      color="oklch(60.987% 0.17833 19.421)"
      options={{ showSpinner: false }}
      shallowRouting
    >
      {pageProps.masterData ? (
        <AppProvider masterData={pageProps.masterData}>
          <AuthProvider>{ChildrenComponent}</AuthProvider>
        </AppProvider>
      ) : (
        <>{ChildrenComponent}</>
      )}
    </ProgressProvider>
  );
}
