import { GetServerSideProps } from "next";

export default function ReadingRedirect() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: { destination: "/ielts-exam-library?skill=reading", permanent: true },
});
