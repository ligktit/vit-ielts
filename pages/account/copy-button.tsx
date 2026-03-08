"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
  text: string;
}

export default function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        onClick={handleCopy}
        className="group relative w-full max-w-md bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
      >
        {copied ? (
          <>
            <Check className="w-5 h-5" />
            <span>Đã sao chép!</span>
          </>
        ) : (
          <>
            <Copy className="w-5 h-5" />
            <span className="font-mono text-lg tracking-wider">{text}</span>
          </>
        )}
      </button>
      <p className="text-xs text-gray-500 mt-2"> Nhấn để sao chép nội dung chuyển khoản</p>
    </>
  );
}

