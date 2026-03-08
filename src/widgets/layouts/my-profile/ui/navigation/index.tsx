import { Card } from "antd";
import Link from "next/link";
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/router";
import { useAuth } from "@/appx/providers";

export const Navigation = ({
  navigation: ACCOUNT_NAVIGATION,
}: {
  navigation: Array<{
    label?: string;
    icon?: string;
    link?: string;
    type?: string;
    danger?: boolean;
  }>;
}) => {
  const router = useRouter();
  const { currentUser } = useAuth();
  const userName = currentUser?.name || "User";

  return (
    <Card
      className="overflow-hidden"
      classNames={{
        body: "p-0!",
      }}
      style={{
        background: "#ffffff",
        border: "2px solid rgba(147, 51, 234, 0.4)",
      }}
    >
      <div className="p-4 border-b border-gray-200">
        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
          WELCOME, {userName.toUpperCase()}
        </p>
      </div>
      <ul className="font-nunito">
        {ACCOUNT_NAVIGATION.map((item, index) => {
          if (item.type === "divider") {
            return (
              <li key={index}>
                <div className="border-t border-gray-200"></div>
                <div className="px-4 py-2">
                  <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    USER
                  </p>
                </div>
              </li>
            );
          }

          if (item.danger) {
            return (
              <li key={index}>
                <Link
                  href={item.link || "#"}
                  className={twMerge(
                    "px-6 py-3 flex hover:bg-gray-50 text-gray-700 items-center duration-200 transition-all space-x-2",
                    item.danger ? "" : ""
                  )}
                >
                  {item.icon && (
                    <span className="material-symbols-rounded">
                      {item.icon}
                    </span>
                  )}
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          }

          const isActive = router.pathname === item.link;

          return (
            <li key={index}>
              <Link
                href={item.link || "#"}
                className={twMerge(
                  "px-6 py-3 flex items-center duration-200 transition-all space-x-2",
                  isActive ? "text-blue-600" : "text-gray-700 hover:bg-gray-50"
                )}
              >
                {item.icon && (
                  <span
                    className={twMerge(
                      "material-symbols-rounded",
                      isActive ? "text-blue-600" : "text-gray-700"
                    )}
                  >
                    {item.icon}
                  </span>
                )}
                <span className={isActive ? "text-blue-600" : ""}>
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Card>
  );
};
