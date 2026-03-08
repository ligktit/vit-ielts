import { withAuth, withMasterData, withMultipleWrapper } from "@/shared/hoc";
import { GetServerSideProps } from "next";

export { PagePaymentHistory } from "./ui";

export const getServerSideProps: GetServerSideProps = withMultipleWrapper(
  withAuth,
  withMasterData
);
