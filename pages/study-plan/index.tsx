import { withMasterData } from "@/shared/hoc";
import type { GetServerSideProps } from "next";

export { PageStudyPlan as default } from "@/pages/study-plan/ui";

export const getServerSideProps: GetServerSideProps = withMasterData;
