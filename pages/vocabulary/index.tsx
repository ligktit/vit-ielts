import { withMasterData } from "@/shared/hoc";
import type { GetServerSideProps } from "next";

export { PageVocabulary as default } from "@/pages/vocabulary/ui";

export const getServerSideProps: GetServerSideProps = withMasterData;
