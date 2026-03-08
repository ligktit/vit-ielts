import { Container } from "@/shared/ui";
import Image from "next/image";

const FEATURES = [
  {
    icon: "favorite",
    iconBg: "rgba(236, 72, 153, 0.1)",
    iconColor: "#ec4899",
    title: "Flexible Classes",
    description:
      "It is a long established fact that a reader will be distracted by this on readable content of when looking at its layout.",
  },
  {
    icon: "menu_book",
    iconBg: "rgba(37, 99, 235, 0.1)",
    iconColor: "#2563eb",
    title: "Learn From Anywhere",
    description:
      "Sed distinctio repudiandae eos recusandae laborum eaque non eius iure suscipit laborum eaque non eius iure suscipit.",
  },
  {
    icon: "computer",
    iconBg: "rgba(255, 127, 80, 0.1)",
    iconColor: "#ff7f50",
    title: "Experienced Teacher's service.",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia, aliquid mollitia Officia, aliquid mollitia.",
  },
];

export const AboutContent = () => {
  return (
    <div className="bg-white py-16 md:py-15">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Side - Images */}
          <div className="relative h-full">
            {/* Image 1 - Main (top-left) */}
            <div className="relative w-full max-w-md aspect-[4/5] rounded-lg overflow-hidden shadow-lg">
              <Image
                src="/img-admin/about-07.jpg"
                alt="Education Images"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            {/* Image 2 - Bottom right (hidden on small screens, shown on xl) */}
            <div className="hidden xl:block absolute bottom-0 right-0 w-56 h-72 rounded-lg overflow-hidden shadow-lg z-10">
              <Image
                src="/img-admin/about-09.jpg"
                alt="Education Images"
                fill
                className="object-cover"
                sizes="224px"
              />
            </div>

            {/* Image 3 - Middle right (hidden on small/medium, shown on md) */}
            <div className="hidden md:block absolute top-1/3 right-0 xl:right-8 w-48 h-64 rounded-lg overflow-hidden shadow-lg z-20 transform -translate-y-1/2">
              <Image
                src="/img-admin/about-08.jpg"
                alt="Education Images"
                fill
                className="object-cover"
                sizes="192px"
              />
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="lg:pl-12">
            <div className="section-title text-start">
              {/* Subtitle */}
              <div className="mb-5">
                <span
                  className="inline-block px-4 py-2 rounded-md text-sm font-semibold text-white"
                  style={{
                    backgroundColor: "rgba(255, 127, 80, 0.8)",
                  }}
                >
                  Know About Us
                </span>
              </div>

              {/* Title */}
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Know About Histudy <br /> Learning Platform
              </h2>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-base leading-relaxed mb-10">
              Far far away, behind the word mountains, far from the countries
              Vokalia and Consonantia, there live the blind texts. Separated
              they live in Bookmarksgrove right at the coast of the Semantics, a
              large language ocean.
            </p>

            {/* Feature List */}
            <div className="space-y-6 mb-10">
              {FEATURES.map((feature, index) => (
                <div key={index} className="flex gap-4">
                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: feature.iconBg,
                    }}
                  >
                    <span
                      className="material-symbols-rounded text-2xl"
                      style={{
                        color: feature.iconColor,
                      }}
                    >
                      {feature.icon}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h6 className="text-lg font-bold text-gray-900 mb-2">
                      {feature.title}
                    </h6>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div>
              <a
                href="#why-choose-us"
                className="group relative inline-block px-8 py-4 text-base font-medium text-white rounded-lg overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{
                  background: "#d94a56",
                }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span>More About Us</span>
                  <span className="material-symbols-rounded transition-all duration-300 group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

