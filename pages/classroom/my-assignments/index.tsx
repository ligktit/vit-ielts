import { GetServerSideProps } from "next";
import { ROUTES } from "@/shared/routes";

// The standalone "Bài tập của tôi" list was removed — students do assignments
// from inside the class ("Bài giao" tab). Redirect any old links to the classes.
export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: { destination: ROUTES.CLASSROOM.LIST, permanent: false },
});

export default function MyAssignmentsRedirect() {
  return null;
}
