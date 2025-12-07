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

  useEffect(() => {
    fetchSelections();
  }, []);

  useEffect(() => {
    filterSelections();
  }, [selections, showMutualOnly]);

  const fetchSelections = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/selections");

      if (!response.ok) {
        throw new Error("Failed to fetch selections");
      }

      const data = await response.json();
      setSelections(data.selections || []);
      setTotalCount(data.total || 0);
      setMutualMatchesCount(data.mutualMatchesCount || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load selections");
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-bold">Selections & Matches</h1>
          <p className="text-[#bfc0c0] mt-1">
            View all participant selections and identify mutual matches
          </p>
        </div>
        <div className="flex gap-3">
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

      {error && <ErrorMessage message={error} onRetry={fetchSelections} />}

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
