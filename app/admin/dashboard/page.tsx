"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorMessage from "@/components/shared/ErrorMessage";
import StatsCard from "@/components/admin/StatsCard";

interface DashboardStats {
  totalParticipants: number;
  pendingChecks: number;
  approvedParticipants: number;
  rejectedParticipants: number;
  totalSelections: number;
  mutualMatches: number;
  maleCount: number;
  femaleCount: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/stats");

      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }

      const data = await response.json();
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stats");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchStats} />;
  }

  if (!stats) {
    return <ErrorMessage message="No stats available" onRetry={fetchStats} />;
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-[#bfc0c0] mt-1">
            Overview of participant registration and selections
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => router.push("/admin/participants")}
          >
            Manage Participants
          </Button>
          <Button onClick={() => router.push("/admin/selections")}>
            View Selections
          </Button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Participants"
          value={stats.totalParticipants}
          color="green"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          }
        />

        <StatsCard
          title="Pending Background Checks"
          value={stats.pendingChecks}
          color="yellow"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />

        <StatsCard
          title="Total Selections"
          value={stats.totalSelections}
          color="blue"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          }
        />

        <StatsCard
          title="Mutual Matches"
          value={stats.mutualMatches}
          color="purple"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Background Check Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[#bfc0c0]">Approved</span>
                <span className="font-semibold text-green-500">
                  {stats.approvedParticipants}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#bfc0c0]">Pending</span>
                <span className="font-semibold text-yellow-500">
                  {stats.pendingChecks}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#bfc0c0]">Rejected</span>
                <span className="font-semibold text-red-500">
                  {stats.rejectedParticipants}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gender Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[#bfc0c0]">Male</span>
                <span className="font-semibold">{stats.maleCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#bfc0c0]">Female</span>
                <span className="font-semibold">{stats.femaleCount}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[#4f5d75]">
                <span className="text-[#bfc0c0]">Total</span>
                <span className="font-semibold">
                  {stats.maleCount + stats.femaleCount}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button
                fullWidth
                variant="secondary"
                onClick={() => router.push("/admin/participants")}
              >
                Manage Participants
              </Button>
              <Button
                fullWidth
                variant="secondary"
                onClick={() => router.push("/admin/selections")}
              >
                View All Selections
              </Button>
              <Button
                fullWidth
                variant="secondary"
                onClick={() => router.push("/admin/selections?export=true")}
              >
                Export Results
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Cards */}
      {stats.pendingChecks > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4">
              <p className="text-yellow-300">
                <strong>Action Required:</strong> You have {stats.pendingChecks}{" "}
                participant{stats.pendingChecks !== 1 ? "s" : ""} waiting for
                background check approval.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
