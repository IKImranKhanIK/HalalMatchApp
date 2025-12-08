"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type = "info",
  onClose,
  duration = 5000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    success: {
      bg: "bg-green-500/10",
      border: "border-green-500/30",
      icon: "✓",
      iconBg: "bg-green-500/20",
      iconColor: "text-green-500",
      textColor: "text-green-300",
    },
    error: {
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      icon: "✕",
      iconBg: "bg-red-500/20",
      iconColor: "text-red-500",
      textColor: "text-red-300",
    },
    info: {
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      icon: "ℹ",
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-500",
      textColor: "text-blue-300",
    },
  };

  const style = typeStyles[type];

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-5 fade-in duration-300">
      <div
        className={`${style.bg} ${style.border} border rounded-2xl p-4 shadow-xl max-w-md flex items-start gap-3`}
      >
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full ${style.iconBg} flex items-center justify-center`}
        >
          <span className={`${style.iconColor} font-bold text-lg`}>
            {style.icon}
          </span>
        </div>
        <div className="flex-1 pt-0.5">
          <p className={`${style.textColor} text-sm`}>{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-[#bfc0c0] hover:text-white transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
