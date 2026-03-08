import { withMasterData, withMultipleWrapper } from "@/shared/hoc";
import { GetServerSideProps } from "next";
import type { WhyChooseUsConfig } from "@/pages/home/ui/why-choose-us/types";
import type { TestimonialsConfig } from "@/pages/home/ui/testimonials/types";

export { PageAboutUs } from "./ui";

// Wrapper function để đọc why choose us config
const withWhyChooseUsConfig = async (
  context: Parameters<GetServerSideProps>[0]
) => {
  let whyChooseUsConfig: WhyChooseUsConfig;

  try {
    // Gọi API route nội bộ để đọc config
    const protocol = context.req.headers["x-forwarded-proto"] || "http";
    const host = context.req.headers.host || "localhost:3000";
    const baseUrl = `${protocol}://${host}`;

    const res = await fetch(`${baseUrl}/api/admin/home/why-choose-us-config`, {
      headers: {
        cookie: context.req.headers.cookie || "",
      },
    });

    if (res.ok) {
      whyChooseUsConfig = await res.json();
    } else {
      throw new Error("Failed to fetch config");
    }
  } catch {
    // Nếu API route fail, dùng config mặc định
    whyChooseUsConfig = {
      badge: {
        text: "Why Choose Us",
      },
      title: "Creating A Community Of Life Long Learners.",
      description:
        "There are many variations of passages of the Ipsum available, but the majority have suffered alteration in some form, by injected humour.",
      statistics: [
        {
          icon: "favorite",
          value: "500+",
          label: "Learners & counting",
        },
        {
          icon: "show_chart",
          value: "800+",
          label: "Courses & Video",
        },
        {
          icon: "cast",
          value: "1,000+",
          label: "Certified Students",
        },
        {
          icon: "map",
          value: "100+",
          label: "Certified Students",
        },
      ],
    };
  }

  return {
    props: {
      whyChooseUsConfig,
    },
  };
};

// Wrapper function để đọc testimonials config
const withTestimonialsConfig = async (
  context: Parameters<GetServerSideProps>[0]
) => {
  let testimonialsConfig: TestimonialsConfig;

  try {
    // Gọi API route nội bộ để đọc config
    const protocol = context.req.headers["x-forwarded-proto"] || "http";
    const host = context.req.headers.host || "localhost:3000";
    const baseUrl = `${protocol}://${host}`;

    const res = await fetch(`${baseUrl}/api/admin/home/testimonials-config`, {
      headers: {
        cookie: context.req.headers.cookie || "",
      },
    });

    if (res.ok) {
      testimonialsConfig = await res.json();
    } else {
      throw new Error("Failed to fetch config");
    }
  } catch {
    // Nếu API route fail, dùng config mặc định
    testimonialsConfig = {
      title: "What Our Learners Say",
      description:
        "Learning communicate to global world and build a bright future with our histudy.",
      button: {
        text: "Marquee Y",
        link: "#",
      },
      testimonials: [
        {
          name: "Martha Maldonado",
          title: "Executive Chairman",
          company: "@ Google",
          quote:
            "After the launch, vulputate at sapien sit amet, auctor iaculis lorem. In vel hend rerit nisi. Vestibulum eget risus velit.",
          avatar: "/img-admin/art-stu-1.png",
        },
        {
          name: "Michael D. Lovelady",
          title: "CEO",
          company: "@ Google",
          quote:
            "Histudy education, vulputate at sapien sit amet, auctor iaculis lorem. In vel hend rerit nisi. Vestibulum eget risus velit.",
          avatar: "/img-admin/art-stu-2.png",
        },
        {
          name: "Valerie J. Creasman",
          title: "Executive Designer",
          company: "@ Google",
          quote:
            "Our educational, vulputate at sapien sit amet, auctor iaculis lorem. In vel hend rerit nisi. Vestibulum eget risus velit.",
          avatar: "/img-admin/art-stu-3.png",
        },
        {
          name: "Hannah R. Sutton",
          title: "Executive Chairman",
          company: "@ Facebook",
          quote:
            "People says about, vulputate at sapien sit amet, auctor iaculis lorem. In vel hend rerit nisi. Vestibulum eget risus velit.",
          avatar: "/img-admin/i-team.png",
        },
        {
          name: "Pearl B. Hill",
          title: "Chairman SR",
          company: "@ Facebook",
          quote:
            "Like this histudy, vulputate at sapien sit amet, auctor iaculis lorem. In vel hend rerit nisi. Vestibulum eget risus velit.",
          avatar: "/img-admin/art-stu-1.png",
        },
        {
          name: "Mandy F. Wood",
          title: "SR Designer",
          company: "@ Google",
          quote:
            "Educational template, vulputate at sapien sit amet, auctor iaculis lorem. In vel hend rerit nisi. Vestibulum eget risus velit.",
          avatar: "/img-admin/art-stu-2.png",
        },
        {
          name: "Mildred W. Diaz",
          title: "Executive Officer",
          company: "@ Yelp",
          quote:
            "Online leaning, vulputate at sapien sit amet, auctor iaculis lorem. In vel hend rerit nisi. Vestibulum eget risus velit.",
          avatar: "/img-admin/art-stu-3.png",
        },
        {
          name: "Christopher H. Win",
          title: "Product Designer",
          company: "@ Google",
          quote:
            "Remote learning, vulputate at sapien sit amet, auctor iaculis lorem. In vel hend rerit nisi. Vestibulum eget risus velit.",
          avatar: "/img-admin/i-team.png",
        },
      ],
    };
  }

  return {
    props: {
      testimonialsConfig,
    },
  };
};

export const getServerSideProps: GetServerSideProps = withMultipleWrapper(
  withMasterData,
  withWhyChooseUsConfig,
  withTestimonialsConfig
);

