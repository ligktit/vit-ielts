import { ROUTES } from "@/shared/routes";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: ROUTES.PRACTICE.ARCHIVE_READING,
      permanent: true,
    },
  };
};

export default function PageIELTSPracticeLibrary() {
  return null;
}
