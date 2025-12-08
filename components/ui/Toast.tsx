"use client";

import { useEffect, useState, useRef } from "react";

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
  const [progress, setProgress] = useState(100);
  const onCloseRef = useRef(onClose);

  // Keep the ref updated
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    // Auto-dismiss timer
    const timer = setTimeout(() => {
      onCloseRef.current();
    }, duration);

    // Progress bar animation (updates every 50ms)
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 50);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [duration]); // Only duration as dependency

  const typeStyles = {
    success: {
      bg: "bg-emerald-50 dark:bg-emerald-900/30",
      border: "border-emerald-200 dark:border-emerald-800",
      icon: "✓",
      iconBg: "bg-emerald-500",
      iconColor: "text-white",
      textColor: "text-emerald-900 dark:text-emerald-100",
      progressBg: "bg-emerald-500",
    },
    error: {
      bg: "bg-red-50 dark:bg-red-900/30",
      border: "border-red-200 dark:border-red-800",
      icon: "✕",
      iconBg: "bg-red-500",
      iconColor: "text-white",
      textColor: "text-red-900 dark:text-red-100",
      progressBg: "bg-red-500",
    },
    info: {
      bg: "bg-blue-50 dark:bg-blue-900/30",
      border: "border-blue-200 dark:border-blue-800",
      icon: "ℹ",
      iconBg: "bg-blue-500",
      iconColor: "text-white",
      textColor: "text-blue-900 dark:text-blue-100",
      progressBg: "bg-blue-500",
    },
  };

  const style = typeStyles[type];

  return (
    <div className="fixed top-24 right-6 z-[9999] animate-in slide-in-from-right-5 fade-in duration-300">
      <div
        className={`${style.bg} ${style.border} border-2 rounded-xl shadow-2xl max-w-md min-w-[320px] overflow-hidden backdrop-blur-sm`}
      >
        <div className="p-4 flex items-start gap-3">
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-lg ${style.iconBg} flex items-center justify-center shadow-lg`}
          >
            <span className={`${style.iconColor} font-bold text-xl`}>
              {style.icon}
            </span>
          </div>
          <div className="flex-1 pt-1">
            <p className={`${style.textColor} text-base font-medium leading-relaxed`}>
              {message}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Close notification"
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
        {/* Progress bar */}
        <div className="h-1 bg-gray-200 dark:bg-gray-700">
          <div
            className={`h-full ${style.progressBg} transition-all duration-50 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
