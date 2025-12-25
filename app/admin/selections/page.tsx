"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorMessage from "@/components/shared/ErrorMessage";

interface Selection {
  id: string;
  created_at: string;
  is_mutual: boolean;
  selector: {
    id: string;
    participant_number: number;
    full_name: string;
    gender: string;
    email: string;
  };
  selected: {
    id: string;
    participant_number: number;
    full_name: string;
    gender: string;
    email: string;
  };
}

// Gender Icon Components
const MaleIcon = () => (
  <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
    <path d="M9.5,11c0,1.4,1.1,2.5,2.5,2.5s2.5-1.1,2.5-2.5S13.4,8.5,12,8.5S9.5,9.6,9.5,11z M19,4v3.5h-2V5.3l-2.8,2.8 c-0.8-0.6-1.8-1-2.9-1c-2.8,0-5,2.2-5,5s2.2,5,5,5s5-2.2,5-5c0-1.1-0.4-2.1-1-2.9L18.1,6h-2.3V4H19z"/>
  </svg>
);

const FemaleIcon = () => (
  <svg className="w-4 h-4 text-pink-400" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12,2c-2.8,0-5,2.2-5,5s2.2,5,5,5s5-2.2,5-5S14.8,2,12,2z M12,10c-1.7,0-3-1.3-3-3s1.3-3,3-3s3,1.3,3,3 S13.7,10,12,10z M13,13.1V15h2v2h-2v3h-2v-3H9v-2h2v-1.9C8.2,12.6,6,10.2,6,7c0-3.3,2.7-6,6-6s6,2.7,6,6 C18,10.2,15.8,12.6,13,13.1z"/>
  </svg>
);

const GenderIcon = ({ gender }: { gender: string }) => {
  return gender === 'male' ? <MaleIcon /> : <FemaleIcon />;
};

export default function AdminSelectionsPage() {
  const [selections, setSelections] = useState<Selection[]>([]);
  const [filteredSelections, setFilteredSelections] = useState<Selection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showMutualOnly, setShowMutualOnly] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [mutualMatchesCount, setMutualMatchesCount] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [viewMode, setViewMode] = useState<"selections" | "by-participant">("selections");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [newSelectionIds, setNewSelectionIds] = useState<Set<string>>(new Set());
  const [recentSelections, setRecentSelections] = useState<Selection[]>([]);

  useEffect(() => {
    fetchSelections(false); // Initial load
  }, []);

  useEffect(() => {
    filterSelections();
  }, [selections, showMutualOnly]);

  // Auto-refresh effect - Optimized to 60 seconds for better performance
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchSelections(true); // Silent background refresh
    }, 60000); // 60 seconds (reduced from 10s for much better performance)

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Update "time ago" every 10 seconds (instead of every 1 second)
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((tick) => tick + 1);
    }, 10000); // 10 seconds (reduced from 1s for much better performance)

    return () => clearInterval(interval);
  }, []);

  // Calculate time since last update
  const getTimeSinceUpdate = () => {
    const seconds = Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const fetchSelections = async (silent = false) => {
    try {
      // Only show loading spinner on initial load
      if (!silent) {
        setLoading(true);
      }
      setError("");

      const response = await fetch("/api/admin/selections");

      if (!response.ok) {
        throw new Error("Failed to fetch selections");
      }

      const data = await response.json();
      const newSelections = data.selections || [];

      // Detect new selections by comparing IDs
      if (silent && selections.length > 0) {
        const existingIds = new Set(selections.map(s => s.id));
        const newIds = newSelections
          .filter((s: Selection) => !existingIds.has(s.id))
          .map((s: Selection) => s.id);

        if (newIds.length > 0) {
          setNewSelectionIds(new Set(newIds));
          // Clear the "new" highlight after 5 seconds
          setTimeout(() => {
            setNewSelectionIds(new Set());
          }, 5000);
        }
      }

      setSelections(newSelections);
      setRecentSelections(newSelections.slice(0, 10)); // Top 10 most recent
      setTotalCount(data.total || 0);
      setMutualMatchesCount(data.mutualMatchesCount || 0);
      setLastUpdated(new Date());
    } catch (err) {
      if (!silent) {
        setError(err instanceof Error ? err.message : "Failed to load selections");
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const filterSelections = () => {
    if (showMutualOnly) {
      setFilteredSelections(selections.filter((s) => s.is_mutual));
    } else {
      setFilteredSelections(selections);
    }
  };

  // Group selections by participant
  const getParticipantVotes = () => {
    const participantMap = new Map<string, {
      participant: Selection['selector'];
      selections: Array<{
        selected: Selection['selected'];
        is_mutual: boolean;
        created_at: string;
      }>;
    }>();

    selections.forEach((selection) => {
      if (!selection.selector) return;

      const key = selection.selector.id;
      if (!participantMap.has(key)) {
        participantMap.set(key, {
          participant: selection.selector,
          selections: []
        });
      }

      participantMap.get(key)!.selections.push({
        selected: selection.selected,
        is_mutual: selection.is_mutual,
        created_at: selection.created_at
      });
    });

    return Array.from(participantMap.values()).sort((a, b) =>
      a.participant.participant_number - b.participant.participant_number
    );
  };

  const handleExport = async () => {
    try {
      setExporting(true);

      const response = await fetch("/api/admin/export");

      if (!response.ok) {
        throw new Error("Failed to export data");
      }

      // Download the CSV file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `halal-match-selections-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Selections & Matches</h1>
            {autoRefresh && (
              <div
                className="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full"
                title="Auto-refreshes every 60 seconds to show new selections"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">Live</span>
                <span className="text-green-400/60 text-xs ml-0.5">(60s)</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-[#bfc0c0]">
              View all participant selections and identify mutual matches
            </p>
            <span className="text-[#bfc0c0] text-xs flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5"
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
              Updated {getTimeSinceUpdate()}
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
                ? "Pause live updates"
                : "Resume live updates"
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
            {autoRefresh ? "Pause" : "Resume"}
          </Button>
          <div className="flex gap-2 bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setViewMode("selections")}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                viewMode === "selections"
                  ? "bg-green-500 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              All Selections
            </button>
            <button
              onClick={() => setViewMode("by-participant")}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                viewMode === "by-participant"
                  ? "bg-green-500 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              By Participant
            </button>
          </div>
          <Button onClick={handleExport} loading={exporting} disabled={exporting}>
            {exporting ? "Exporting..." : "Export to CSV"}
          </Button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={() => fetchSelections(false)} />}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-[#bfc0c0] mb-2">Total Selections</p>
            <p className="text-3xl font-bold">{totalCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-[#bfc0c0] mb-2">Mutual Matches</p>
            <p className="text-3xl font-bold text-green-500">
              {mutualMatchesCount}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-[#bfc0c0] mb-2">Match Rate</p>
            <p className="text-3xl font-bold">
              {totalCount > 0
                ? ((mutualMatchesCount / totalCount) * 100).toFixed(1)
                : 0}
              %
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Live Activity Feed */}
      {recentSelections.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle>🔥 Live Activity Feed</CardTitle>
                {autoRefresh && (
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                )}
              </div>
              <span className="text-sm text-[#bfc0c0]">
                Last {recentSelections.length} selections
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSelections.map((selection, index) => {
                const isNew = newSelectionIds.has(selection.id);
                const timeAgo = (() => {
                  const seconds = Math.floor((new Date().getTime() - new Date(selection.created_at).getTime()) / 1000);
                  if (seconds < 60) return `${seconds}s ago`;
                  const minutes = Math.floor(seconds / 60);
                  if (minutes < 60) return `${minutes}m ago`;
                  const hours = Math.floor(minutes / 60);
                  if (hours < 24) return `${hours}h ago`;
                  return new Date(selection.created_at).toLocaleDateString();
                })();

                return (
                  <div
                    key={selection.id}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-500 ${
                      isNew
                        ? "bg-green-500/10 border-green-500/50 animate-in slide-in-from-right-5 shadow-lg shadow-green-500/20"
                        : selection.is_mutual
                        ? "bg-green-500/5 border-green-500/20 hover:bg-green-500/10"
                        : "bg-gray-800/50 border-gray-700 hover:bg-gray-800 hover:border-blue-500/30 hover:shadow-md hover:shadow-blue-500/10"
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center gap-2 min-w-[180px]">
                        <GenderIcon gender={selection.selector.gender} />
                        <div>
                          <p className="font-semibold text-sm">
                            #{selection.selector.participant_number}
                          </p>
                          <p className="text-xs text-[#bfc0c0]">
                            {selection.selector.full_name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {selection.is_mutual ? (
                          <>
                            <svg
                              className="w-5 h-5 text-green-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 8l4 4m0 0l-4 4m4-4H3"
                              />
                            </svg>
                            <svg
                              className="w-5 h-5 text-green-400 animate-pulse"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </>
                        ) : (
                          <div className="relative">
                            <svg
                              className="w-5 h-5 text-blue-400 animate-pulse"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 8l4 4m0 0l-4 4m4-4H3"
                              />
                            </svg>
                            <svg
                              className="w-5 h-5 text-blue-400/40 absolute top-0 left-0 animate-ping"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 8l4 4m0 0l-4 4m4-4H3"
                              />
                            </svg>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 min-w-[180px]">
                        <GenderIcon gender={selection.selected.gender} />
                        <div>
                          <p className="font-semibold text-sm">
                            #{selection.selected.participant_number}
                          </p>
                          <p className="text-xs text-[#bfc0c0]">
                            {selection.selected.full_name}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#bfc0c0] whitespace-nowrap">
                        {timeAgo}
                      </span>
                      {selection.is_mutual ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500 text-white shadow-lg shadow-green-500/30 animate-pulse">
                          ✓ MATCH!
                        </span>
                      ) : (
                        <div className="relative">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1.5 animate-pulse">
                            <svg
                              className="w-3 h-3 animate-spin"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Waiting...
                          </span>
                        </div>
                      )}
                      {isNew && (
                        <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-orange-500 text-white animate-bounce">
                          NEW
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters - Only show for selections view */}
      {viewMode === "selections" && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showMutualOnly}
                  onChange={(e) => setShowMutualOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-green-500"
                />
                <span className="text-sm">Show mutual matches only</span>
              </label>
              <span className="text-sm text-[#bfc0c0]">
                Showing {filteredSelections.length} of {selections.length}{" "}
                selections
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selections View */}
      {viewMode === "selections" && (
        <Card>
        <CardContent className="p-0">
          {filteredSelections.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#bfc0c0]">
                {showMutualOnly
                  ? "No mutual matches found"
                  : "No selections found"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-[#4f5d75]">
                  <tr className="text-left text-sm text-[#bfc0c0]">
                    <th className="p-4 font-medium">Selector</th>
                    <th className="p-4 font-medium">Selected</th>
                    <th className="p-4 font-medium">Match Status</th>
                    <th className="p-4 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSelections.map((selection) => (
                    <tr
                      key={selection.id}
                      className="border-b border-[#4f5d75] hover:bg-[#4f5d75]/20"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <GenderIcon gender={selection.selector.gender} />
                          <div>
                            <p className="font-semibold">
                              #{selection.selector.participant_number} -{" "}
                              {selection.selector.full_name}
                            </p>
                            <p className="text-sm text-[#bfc0c0] capitalize">
                              {selection.selector.gender}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <GenderIcon gender={selection.selected.gender} />
                          <div>
                            <p className="font-semibold">
                              #{selection.selected.participant_number} -{" "}
                              {selection.selected.full_name}
                            </p>
                            <p className="text-sm text-[#bfc0c0] capitalize">
                              {selection.selected.gender}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {selection.is_mutual ? (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                            ✓ Mutual Match
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-400">
                            One-way
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-[#bfc0c0]">
                        {new Date(selection.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      )}

      {/* By Participant View */}
      {viewMode === "by-participant" && (
        <Card>
          <CardContent className="p-0">
            {getParticipantVotes().length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#bfc0c0]">No selections found</p>
              </div>
            ) : (
              <div className="divide-y divide-[#4f5d75]">
                {getParticipantVotes().map((participantData) => (
                  <div key={participantData.participant.id} className="p-6">
                    {/* Participant Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <GenderIcon gender={participantData.participant.gender} />
                        <div>
                          <h3 className="text-lg font-semibold">
                            #{participantData.participant.participant_number} -{" "}
                            {participantData.participant.full_name}
                          </h3>
                          <p className="text-sm text-[#bfc0c0] capitalize">
                            {participantData.participant.gender} • {participantData.selections.length}{" "}
                            selection{participantData.selections.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-[#bfc0c0]">
                          {participantData.selections.filter(s => s.is_mutual).length} mutual match
                          {participantData.selections.filter(s => s.is_mutual).length !== 1 ? "es" : ""}
                        </p>
                      </div>
                    </div>

                    {/* Participant's Selections */}
                    <div className="space-y-2">
                      {participantData.selections.length === 0 ? (
                        <p className="text-sm text-[#bfc0c0] italic">No selections made</p>
                      ) : (
                        <div className="grid gap-2">
                          {participantData.selections.map((selectionData, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-[#bfc0c0]">→</span>
                                <GenderIcon gender={selectionData.selected.gender} />
                                <div>
                                  <p className="font-medium">
                                    #{selectionData.selected.participant_number} -{" "}
                                    {selectionData.selected.full_name}
                                  </p>
                                  <p className="text-xs text-[#bfc0c0] capitalize">
                                    {selectionData.selected.gender}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-[#bfc0c0]">
                                  {new Date(selectionData.created_at).toLocaleDateString()}
                                </span>
                                {selectionData.is_mutual ? (
                                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                                    ✓ Mutual
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-400">
                                    One-way
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      {mutualMatchesCount > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
              <p className="text-green-300">
                <strong>Great news!</strong> There {mutualMatchesCount === 1 ? 'is' : 'are'}{" "}
                {mutualMatchesCount} mutual match{mutualMatchesCount !== 1 ? 'es' : ''} in this event.
                You can export all selections and matches using the &quot;Export to CSV&quot; button above.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
