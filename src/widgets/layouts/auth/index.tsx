import { Footer, Header } from "../base/ui";

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Header />
      <main className="pb-16 pt-8">{children}</main>
      <Footer />
    </>
  );
};
