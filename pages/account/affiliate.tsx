import { withAuth, withMasterData, withMultipleWrapper } from "@/shared/hoc";
import { GetServerSideProps } from "next";

export {
  PageAffiliate as default,
} from "@/pages/account/affiliate";

export const getServerSideProps: GetServerSideProps = withMultipleWrapper(
  withAuth,
  withMasterData
);

