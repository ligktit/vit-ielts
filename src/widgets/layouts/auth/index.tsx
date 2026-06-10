import { Header } from "../base/ui";
import { Footer } from "@/shared/ui/ds/organisms/footer";
import { FOOTER_COLUMNS } from "../footer-columns";

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Header />
      <main className="pb-16 pt-8">{children}</main>
      <Footer columns={FOOTER_COLUMNS} showCopyright />
    </>
  );
};
