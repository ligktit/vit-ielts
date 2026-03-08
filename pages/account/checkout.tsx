import CheckoutPage from "../checkout";
import { withAuth, withMasterData, withMultipleWrapper } from "@/shared/hoc";
import { GetServerSideProps } from "next";

export default CheckoutPage;

export const getServerSideProps: GetServerSideProps = withMultipleWrapper(
  withAuth,
  withMasterData
);

