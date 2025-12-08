"use client";

import { useEffect } from "react";
import Button from "./Button";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  loading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "warning",
  loading = false,
}: ConfirmDialogProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      icon: "🛑",
      iconBg: "bg-red-500/10",
      iconColor: "text-red-500",
    },
    warning: {
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/20",
      icon: "⚠️",
      iconBg: "bg-yellow-500/10",
      iconColor: "text-yellow-500",
    },
    info: {
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      icon: "ℹ️",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-500",
    },
  };

  const style = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-[#3d4457] border border-[#4f5d75] rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-6 animate-in fade-in zoom-in duration-200">
        {/* Icon */}
        <div className="flex justify-center">
          <div
            className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${style.iconBg}`}
          >
            <span className="text-3xl">{style.icon}</span>
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <p className="text-[#bfc0c0] text-sm leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            fullWidth
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            fullWidth
            onClick={() => {
              onConfirm();
            }}
            loading={loading}
            disabled={loading}
            className={
              variant === "danger"
                ? "bg-red-600 hover:bg-red-700"
                : variant === "warning"
                ? "bg-yellow-600 hover:bg-yellow-700"
                : ""
            }
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
