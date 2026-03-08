import { Facebook, TwitterX, Telegram } from "@/shared/ui/icons";
import { Button } from "antd";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

function SharePost({ url: customUrl }: { url?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    setUrl(customUrl || window.location.href);
  }, [customUrl]);

  const links = [
    {
      icon: <Facebook />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    },
    {
      icon: <TwitterX />,
      url: `https://twitter.com/intent/tweet?url=${url}`,
    },
    {
      icon: <Telegram />,
      url: `https://t.me/share/url?url=${url}&text=`,
    },
  ];

  const handleCopy = () => {
    inputRef.current?.select();
    navigator.clipboard.writeText(url);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      <h3 className="text-lg md:text-xl font-bold text-red-800">
        Share with friends
      </h3>
      <input
        ref={inputRef}
        className="bg-gray-200 text-gray-500 text-xs outline-none px-7 py-2 rounded-full italic w-full max-w-2xs"
        value={url}
        readOnly
      />
      <div className="flex items-center space-x-4">
        <Button onClick={handleCopy}>
          <span className="material-symbols-rounded text-base!">
            content_copy
          </span>
          <span className="font-bold font-nunito">Copy</span>
        </Button>
        <div className="flex items-center space-x-2">
          <span className="material-symbols-rounded text-gray-500">share</span>
          {links.map((item, index) => (
            <Link
              key={index}
              href={item.url}
              target="_blank"
              className="w-7 h-7 bg-primary flex items-center justify-center text-white rounded-full hover:bg-primary-400"
            >
              {item.icon}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SharePost;
