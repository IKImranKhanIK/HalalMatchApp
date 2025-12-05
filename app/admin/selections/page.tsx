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

export default function AdminSelectionsPage() {
  const [selections, setSelections] = useState<Selection[]>([]);
  const [filteredSelections, setFilteredSelections] = useState<Selection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showMutualOnly, setShowMutualOnly] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [mutualMatchesCount, setMutualMatchesCount] = useState(0);
  const [exporting, setExporting] = useState(false);

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
        <Button onClick={handleExport} loading={exporting} disabled={exporting}>
          {exporting ? "Exporting..." : "Export to CSV"}
        </Button>
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
            <p className="text-3xl font-bold text-purple-500">
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

      {/* Filters */}
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

      {/* Selections Table */}
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
                        <div>
                          <p className="font-semibold">
                            #{selection.selector.participant_number} -{" "}
                            {selection.selector.full_name}
                          </p>
                          <p className="text-sm text-[#bfc0c0] capitalize">
                            {selection.selector.gender}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-semibold">
                            #{selection.selected.participant_number} -{" "}
                            {selection.selected.full_name}
                          </p>
                          <p className="text-sm text-[#bfc0c0] capitalize">
                            {selection.selected.gender}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        {selection.is_mutual ? (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-500 border border-purple-500/20">
                            Mutual Match
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

      {/* Info Card */}
      {mutualMatchesCount > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4">
              <p className="text-purple-300">
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
