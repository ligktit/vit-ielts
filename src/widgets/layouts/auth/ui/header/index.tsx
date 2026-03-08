import Image from "next/image";
import Link from "next/link";
import { Container } from "@/shared/ui";
import { ROUTES } from "@/shared/routes";

export const Header = () => {
  return (
    <header>
      <Container className="py-1 md:py-2 h-[100px] md:h-[150px]">
        <div className="flex items-center h-full justify-center">
          <Link
            title="Home"
            href={ROUTES.HOME}
            className="h-full md:w-44 aspect-[750/449] relative duration-300"
          >
            <Image
              sizes="100%"
              alt="logo"
              src="/logo.png"
              priority
              fill
              className="object-contain"
            />
          </Link>
        </div>
      </Container>
    </header>
  );
};
