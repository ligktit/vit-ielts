import { withMasterData } from "@/shared/hoc";
import type { GetServerSideProps } from "next";

export { PageCommunity as default } from "@/pages/community/ui";

export const getServerSideProps: GetServerSideProps = withMasterData;
