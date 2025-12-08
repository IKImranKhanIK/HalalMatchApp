"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorMessage from "@/components/shared/ErrorMessage";
import StatsCard from "@/components/admin/StatsCard";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Toast from "@/components/ui/Toast";
import AnalyticsCharts from "@/components/admin/AnalyticsCharts";

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

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  variant?: "danger" | "warning" | "info";
}

interface ToastState {
  message: string;
  type: "success" | "error" | "info";
}

interface Participant {
  gender: string;
  age?: number;
  background_check_status: string;
  occupation?: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resetting, setResetting] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchStats(false); // Initial load with loading spinner
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchStats(true); // Silent background refresh
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Force re-render every second to update "Last updated" time
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((tick) => tick + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Calculate time since last update
  const getTimeSinceUpdate = () => {
    const seconds = Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  };

  const fetchStats = async (silent = false) => {
    try {
      // Only show loading spinner on initial load, not during auto-refresh
      if (!silent) {
        setLoading(true);
      }
      setError("");

      // Fetch stats and participants in parallel
      const [statsResponse, participantsResponse] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/participants"),
      ]);

      if (!statsResponse.ok) {
        throw new Error("Failed to fetch stats");
      }

      if (!participantsResponse.ok) {
        throw new Error("Failed to fetch participants");
      }

      const statsData = await statsResponse.json();
      const participantsData = await participantsResponse.json();

      setStats(statsData.stats);
      setParticipants(participantsData.participants || []);
      setLastUpdated(new Date());
    } catch (err) {
      // Only show error message if not a silent refresh
      if (!silent) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const handleResetSelections = () => {
    setConfirmDialog({
      isOpen: true,
      title: "Clear All Selections?",
      message: "Are you sure you want to clear ALL selections? This action cannot be undone!",
      variant: "warning",
      onConfirm: async () => {
        try {
          setResetting(true);
          const response = await fetch("/api/admin/reset/selections", {
            method: "POST",
          });

          if (!response.ok) {
            throw new Error("Failed to reset selections");
          }

          setConfirmDialog(null);
          setToast({
            message: "All selections have been cleared successfully!",
            type: "success",
          });
          fetchStats(true); // Silent refresh after reset
        } catch (err) {
          setConfirmDialog(null);
          setToast({
            message: err instanceof Error ? err.message : "Failed to reset selections",
            type: "error",
          });
        } finally {
          setResetting(false);
        }
      },
    });
  };

  const handleResetEverything = () => {
    setConfirmDialog({
      isOpen: true,
      title: "⚠️ Delete Everything?",
      message: "WARNING: This will permanently delete ALL participants and selections. This action cannot be undone! Are you absolutely sure?",
      variant: "danger",
      onConfirm: () => {
        // Show second confirmation
        setConfirmDialog({
          isOpen: true,
          title: "Final Warning",
          message: "This is your last chance. All data will be permanently deleted. Do you want to continue?",
          variant: "danger",
          onConfirm: async () => {
            try {
              setResetting(true);
              const response = await fetch("/api/admin/reset/participants", {
                method: "POST",
              });

              if (!response.ok) {
                throw new Error("Failed to reset database");
              }

              setConfirmDialog(null);
              setToast({
                message: "All data has been cleared successfully!",
                type: "success",
              });
              fetchStats(true); // Silent refresh after reset
            } catch (err) {
              setConfirmDialog(null);
              setToast({
                message: err instanceof Error ? err.message : "Failed to reset database",
                type: "error",
              });
            } finally {
              setResetting(false);
            }
          },
        });
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={() => fetchStats(false)} />;
  }

  if (!stats) {
    return <ErrorMessage message="No stats available" onRetry={() => fetchStats(false)} />;
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            {autoRefresh && (
              <div
                className="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full"
                title="Dashboard auto-refreshes every 30 seconds"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">Live</span>
                <span className="text-green-400/60 text-xs ml-0.5">(30s)</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-[#bfc0c0]">
              Overview of participant registration and selections
            </p>
            <span className="text-[#bfc0c0] text-sm flex items-center gap-1.5">
              <svg
                className="w-4 h-4"
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
              Last updated: {getTimeSinceUpdate()}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="flex items-center gap-2"
            title={
              autoRefresh
                ? "Pause automatic refresh (currently refreshes every 30 seconds)"
                : "Resume automatic refresh"
            }
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  autoRefresh
                    ? "M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    : "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                }
              />
            </svg>
            <span className="flex flex-col items-start leading-tight">
              <span className="font-medium">
                {autoRefresh ? "Pause" : "Resume"}
              </span>
              <span className="text-xs opacity-60">Auto-Refresh</span>
            </span>
          </Button>
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

      {/* Analytics & Insights */}
      {participants.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">Analytics & Insights</h2>
            <p className="text-[#bfc0c0] mt-1">
              Visual breakdown of participant demographics and status
            </p>
          </div>
          <Card>
            <CardContent className="py-6">
              <AnalyticsCharts participants={participants} />
            </CardContent>
          </Card>
        </div>
      )}

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

      {/* Danger Zone */}
      <Card>
        <CardHeader>
          <CardTitle className="text-red-400">⚠️ Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
              <p className="text-[#bfc0c0] text-sm mb-4">
                These actions are permanent and cannot be undone. Use with caution.
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-white">Clear All Selections</h4>
                    <p className="text-[#bfc0c0] text-sm">
                      Delete all participant selections but keep participant data
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={handleResetSelections}
                    disabled={resetting}
                    className="ml-4 bg-red-500/20 hover:bg-red-500/30 border-red-500/30"
                  >
                    {resetting ? "Clearing..." : "Clear Selections"}
                  </Button>
                </div>
                <div className="border-t border-red-500/20 pt-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-white">Reset Everything</h4>
                      <p className="text-[#bfc0c0] text-sm">
                        Delete ALL participants and selections - complete reset
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={handleResetEverything}
                      disabled={resetting}
                      className="ml-4 bg-red-600/20 hover:bg-red-600/30 border-red-600/30"
                    >
                      {resetting ? "Resetting..." : "Reset All Data"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirm Dialog */}
      {confirmDialog && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog(null)}
          onConfirm={confirmDialog.onConfirm}
          title={confirmDialog.title}
          message={confirmDialog.message}
          variant={confirmDialog.variant}
          confirmText="Yes, Continue"
          cancelText="Cancel"
          loading={resetting}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
