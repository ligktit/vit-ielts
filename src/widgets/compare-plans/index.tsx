import { Card } from "antd";
import Image from "next/image";
import { twMerge } from "tailwind-merge";

const features = [
  {
    title: "Listening & Reading practice",
    free: true,
    pro: true,
  },
  {
    title: "Answers & explanations",
    free: true,
    pro: true,
  },
  {
    title: "Practice with Premium test sets",
    free: false,
    pro: true,
  },
];

export function ComparePlans() {
  return (
    <Card>
      <div className="space-y-3">
        <div className="mx-auto w-20 h-20 rounded-full bg-secondary-200 p-2">
          <div className="relative w-full h-full">
            <Image
              src="/4060913.webp"
              alt="crown"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        </div>
        <div className="text-center border-b border-gray-300 pb-3">
          <h3 className="font-bold text-lg">IELTS Practice Room</h3>
          <p className="text-sm text-gray-500">
            Complete 4-skill IELTS practice
          </p>
        </div>
        <table className="table-auto w-full">
          <tbody>
            <tr className="uppercase font-bold">
              <td className="p-2">Benefits</td>
              <td className="p-2 text-center">Free</td>
              <td className="p-2 text-center">
                <span className="text-tertiary-500">Pro</span>
              </td>
            </tr>
            {features.map((feature, index) => (
              <tr className="" key={index}>
                <td className="p-2">{feature.title}</td>
                <td className="text-center">
                  <div className="flex items-center justify-center">
                    <span
                      className={twMerge(
                        "material-symbols-rounded filled",
                        feature.free ? "text-green-500" : "text-gray-400"
                      )}
                    >
                      {feature.free ? "check_circle" : "cancel"}
                    </span>
                  </div>
                </td>
                <td className="text-center">
                  <div className="flex items-center justify-center">
                    <span
                      className={twMerge(
                        "material-symbols-rounded filled",
                        feature.pro ? "text-green-500" : "text-gray-400"
                      )}
                    >
                      {feature.pro ? "check_circle" : "cancel"}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
