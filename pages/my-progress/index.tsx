import { withMasterData } from "@/shared/hoc";
import type { GetServerSideProps } from "next";

export { PageMyProgress as default } from "@/pages/my-progress/ui";

export const getServerSideProps: GetServerSideProps = withMasterData;
