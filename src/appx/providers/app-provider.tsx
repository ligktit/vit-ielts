import { createContext, useCallback, useContext, useMemo, useState } from "react";

export type MenuItem = {
  key: number;
  label: string | React.ReactNode;
  uri: string;
  children?: Array<MenuItem>;
};

export type MasterData = {
  websiteOptions: {
    websiteOptionsFields: {
      generalSettings: {
        favicon: {
          node: {
            sourceUrl: string;
          };
        };
        logo: {
          node: {
            sourceUrl: string;
          };
        };
        defaultContentImage: {
          node: {
            sourceUrl: string;
          };
        };
        facebook: string;
        email: string;
        zalo: string;
        phoneNumber: string;
        preventCopy: boolean;
        buyProLink: string;
        bannerTestResult?: {
          node: {
            sourceUrl: string;
          };
        } | null;
      };
    };
  };
  allSettings: {
    generalSettingsTitle: string;
  };
  menuData: {
    [key: string]: Array<MenuItem>;
  };
  viewer?: {
    id: string;
    name: string;
    roles: {
      nodes: Array<{ name: string }>;
    };
    userData: {
      avatar?: {
        node: {
          mediaDetails: {
            sizes: Array<{
              sourceUrl: string;
              width: string;
            }>;
          };
          srcSet: string;
        };
      } | null;
      isPro: boolean;
      proExpirationDate?: string | null;
      proSkills?: string[] | null;
    };
  } | null;
  /** True when at least one published "Blog" post exists — hides the Blog menu when false. */
  hasBlogPosts?: boolean;
  // userCredentials removed — Supabase Auth manages session internally
};

type Context = {
  masterData: MasterData;
  updateViewerAvatar: (url: string) => void;
};

const defaultMasterData: MasterData = {
  websiteOptions: {
    websiteOptionsFields: {
      generalSettings: {
        favicon: { node: { sourceUrl: "" } },
        logo: { node: { sourceUrl: "" } },
        defaultContentImage: { node: { sourceUrl: "" } },
        facebook: "",
        email: "",
        zalo: "",
        phoneNumber: "",
        preventCopy: false,
        buyProLink: "",
      },
    },
  },
  allSettings: {
    generalSettingsTitle: "",
  },
  menuData: {},
};

const noop = () => {};
const AppContext = createContext<Context>({ masterData: defaultMasterData, updateViewerAvatar: noop });

export const useAppContext = () => {
  const context = useContext(AppContext);
  return {
    masterData: context?.masterData || defaultMasterData,
    updateViewerAvatar: context?.updateViewerAvatar ?? noop,
  };
};

export const AppProvider = ({
  children,
  masterData: initialMasterData,
}: {
  children: React.ReactNode;
  masterData: MasterData;
}) => {
  // undefined = use SSR value as-is (no client override yet)
  // string   = client has uploaded a new avatar; propagate without a hard reload
  const [avatarOverride, setAvatarOverride] = useState<string | undefined>(undefined);

  const masterData = useMemo<MasterData>(() => {
    if (!initialMasterData.viewer || avatarOverride === undefined) return initialMasterData;
    return {
      ...initialMasterData,
      viewer: {
        ...initialMasterData.viewer,
        userData: {
          ...initialMasterData.viewer.userData,
          avatar: {
            node: {
              mediaDetails: { sizes: [{ sourceUrl: avatarOverride, width: "96" }] },
              srcSet: avatarOverride,
            },
          },
        },
      },
    };
  }, [initialMasterData, avatarOverride]);

  const updateViewerAvatar = useCallback((url: string) => setAvatarOverride(url), []);

  const contextValue = useMemo(
    () => ({ masterData, updateViewerAvatar }),
    [masterData, updateViewerAvatar]
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};
