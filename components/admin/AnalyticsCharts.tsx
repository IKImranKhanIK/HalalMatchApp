"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
} from "recharts";

interface AnalyticsChartsProps {
  participants: Array<{
    gender: string;
    age?: number;
    background_check_status: string;
    occupation?: string;
  }>;
}

// Custom colors
const COLORS = {
  primary: "#ef8354",
  secondary: "#4f8ef7",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  male: "#4f8ef7",
  female: "#ec4899",
};

export default function AnalyticsCharts({ participants }: AnalyticsChartsProps) {
  // Gender Distribution Data - Memoized for performance
  const genderData = useMemo(() => [
    {
      name: "Male",
      value: participants.filter((p) => p.gender === "male").length,
      color: COLORS.male,
    },
    {
      name: "Female",
      value: participants.filter((p) => p.gender === "female").length,
      color: COLORS.female,
    },
  ].filter((item) => item.value > 0), [participants]);

  // Age Distribution Data - Memoized for performance
  const ageData = useMemo(() => {
    const ageRanges = [
      { range: "18-25", min: 18, max: 25 },
      { range: "26-35", min: 26, max: 35 },
      { range: "36-45", min: 36, max: 45 },
      { range: "46-60", min: 46, max: 60 },
      { range: "60+", min: 60, max: Infinity },
    ];

    return ageRanges.map(({ range, min, max }) => ({
      name: range,
      count: participants.filter(
        (p) => p.age && p.age >= min && p.age <= max
      ).length,
    }));
  }, [participants]);

  // Background Check Status Data - Memoized for performance
  const statusData = useMemo(() => [
    {
      name: "Pending",
      value: participants.filter((p) => p.background_check_status === "pending")
        .length,
      color: COLORS.warning,
    },
    {
      name: "Approved",
      value: participants.filter(
        (p) => p.background_check_status === "approved"
      ).length,
      color: COLORS.success,
    },
    {
      name: "Rejected",
      value: participants.filter(
        (p) => p.background_check_status === "rejected"
      ).length,
      color: COLORS.danger,
    },
  ].filter((item) => item.value > 0), [participants]);

  // Occupation Distribution Data (Top 10) - Memoized for performance
  const occupationData = useMemo(() => {
    const occupationCounts = participants.reduce((acc, p) => {
      if (p.occupation) {
        const occupation = p.occupation.toLowerCase().trim();
        acc[occupation] = (acc[occupation] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(occupationCounts)
      .map(([name, count]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [participants]);

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#2d3142] border border-[#4f5d75] rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{payload[0].name}</p>
          <p className="text-[#bfc0c0]">
            Count: <span className="font-bold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Handle empty data
  const isEmpty = participants.length === 0;

  if (isEmpty) {
    return (
      <div className="bg-[#2d3142] rounded-lg p-8 text-center">
        <p className="text-[#bfc0c0]">
          No participant data available to display analytics.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gender Distribution */}
      <div className="bg-[#2d3142] rounded-lg p-6 border border-[#4f5d75]">
        <h3 className="text-xl font-semibold mb-4 text-white">
          Gender Distribution
        </h3>
        {genderData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {genderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-[#bfc0c0]">
            No gender data available
          </div>
        )}
      </div>

      {/* Age Distribution */}
      <div className="bg-[#2d3142] rounded-lg p-6 border border-[#4f5d75]">
        <h3 className="text-xl font-semibold mb-4 text-white">
          Age Distribution
        </h3>
        {ageData.some((d) => d.count > 0) ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4f5d75" />
              <XAxis
                dataKey="name"
                stroke="#bfc0c0"
                tick={{ fill: "#bfc0c0" }}
              />
              <YAxis stroke="#bfc0c0" tick={{ fill: "#bfc0c0" }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="count" fill={COLORS.primary} name="Participants" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-[#bfc0c0]">
            No age data available
          </div>
        )}
      </div>

      {/* Background Check Status */}
      <div className="bg-[#2d3142] rounded-lg p-6 border border-[#4f5d75]">
        <h3 className="text-xl font-semibold mb-4 text-white">
          Background Check Status
        </h3>
        {statusData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-[#bfc0c0]">
            No status data available
          </div>
        )}
      </div>

      {/* Occupation Distribution */}
      <div className="bg-[#2d3142] rounded-lg p-6 border border-[#4f5d75]">
        <h3 className="text-xl font-semibold mb-4 text-white">
          Top 10 Occupations
        </h3>
        {occupationData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={occupationData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#4f5d75" />
              <XAxis type="number" stroke="#bfc0c0" tick={{ fill: "#bfc0c0" }} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#bfc0c0"
                tick={{ fill: "#bfc0c0" }}
                width={100}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="count" fill={COLORS.secondary} name="Count" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-[#bfc0c0]">
            No occupation data available
          </div>
        )}
      </div>
    </div>
  );
}
