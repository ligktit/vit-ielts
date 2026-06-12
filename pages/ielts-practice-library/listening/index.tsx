import { GetServerSideProps } from "next";

export default function ListeningRedirect() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: { destination: "/ielts-exam-library?skill=listening", permanent: true },
});
