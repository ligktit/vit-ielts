import { createContext, useContext } from "react";
import { useQuery } from "@/shared/graphql/compat";

const GET_TARGET_SCORE = "";

type TargetScore = {
  examDate: string | null;
  listening: number | null;
  reading: number | null;
  speaking: number | null;
  writing: number | null;
};

const defaultValue: TargetScore = {
  examDate: null,
  listening: null,
  reading: null,
  speaking: null,
  writing: null,
};

const WidgetContext = createContext<{
  targetScore: TargetScore;
  refetch: () => Promise<any>;
  loading: boolean;
}>({
  targetScore: defaultValue,
  refetch: () => Promise.resolve({}),
  loading: false,
});

export const useWidgetContext = () => {
  return useContext(WidgetContext);
};

export const WidgetContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { data, refetch, loading } = useQuery<{
    viewer: { userData: { targetScore: TargetScore } };
  }>(GET_TARGET_SCORE, {
    context: {
      authRequired: true,
    },
    notifyOnNetworkStatusChange: true,
  });

  return (
    <WidgetContext.Provider
      value={{
        targetScore: data?.viewer.userData.targetScore || defaultValue,
        refetch,
        loading,
      }}
    >
      {children}
    </WidgetContext.Provider>
  );
};
