/**
 * Stats Card Component
 * Displays a single statistic with icon
 */

import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/Card";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon?: ReactNode;
  color?: "green" | "blue" | "yellow" | "red" | "purple";
  subtitle?: string;
}

export default function StatsCard({
  title,
  value,
  icon,
  color = "green",
  subtitle,
}: StatsCardProps) {
  const colorClasses = {
    green: "bg-green-500/10 text-green-500",
    blue: "bg-blue-500/10 text-blue-500",
    yellow: "bg-yellow-500/10 text-yellow-500",
    red: "bg-red-500/10 text-red-500",
    purple: "bg-purple-500/10 text-purple-500",
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-400 mb-2">{title}</p>
            <p className="text-3xl font-bold mb-1">{value}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
          {icon && (
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClasses[color]}`}
            >
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
