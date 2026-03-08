"use client";

import { useState } from "react";
import { Container } from "@/shared/ui";
import type { FAQConfig } from "./types";

interface FAQProps {
  config: FAQConfig;
}

export const FAQ = ({ config }: FAQProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-white py-16">
      <Container>
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="text-center mb-6">
            <span
              className="inline-block px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider"
              style={{
                backgroundColor: "rgba(255, 127, 80, 0.1)",
                color: "#d94a56",
              }}
            >
              {config.badge.text}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 text-center mb-4">
            {config.title}
          </h2>

          {/* Description */}
          <p className="text-gray-600 text-lg text-center max-w-2xl mx-auto mb-12">
            {config.description}
          </p>

          {/* FAQ Items */}
          <div className="space-y-4">
            {config.items.map((item, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden transition-all hover:shadow-md"
              >
                {/* Question */}
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                >
                  <span className="text-gray-900 font-semibold text-lg pr-4 flex-1">
                    {item.question}
                  </span>
                  <span
                    className={`text-gray-600 text-2xl font-light transition-transform duration-300 flex-shrink-0 ${
                      openIndex === index ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>
                </button>

                {/* Answer */}
                {openIndex === index && (
                  <div className="px-6 pb-5 pt-0 border-t border-gray-100">
                    <p className="text-gray-600 leading-relaxed pt-4">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
};

