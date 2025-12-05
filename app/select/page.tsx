"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorMessage from "@/components/shared/ErrorMessage";
import QRScanner from "@/components/participant/QRScanner";
import {
  getParticipantSession,
  clearParticipantSession,
} from "@/lib/auth/participant-session";

type SelectionMode = "grid" | "scanner";

interface Participant {
  id: string;
  participant_number: number;
  full_name: string;
  gender: string;
}

interface Selection {
  id: string;
  selected_id: string;
  created_at: string;
}

export default function SelectPage() {
  const router = useRouter();
  const [session, setSession] = useState(getParticipantSession());
  const [mode, setMode] = useState<SelectionMode>("grid");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selections, setSelections] = useState<Selection[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [scanSuccess, setScanSuccess] = useState("");

  // Redirect if not logged in
  useEffect(() => {
    if (!session) {
      router.push("/login");
    }
  }, [session, router]);

  // Fetch participants and selections
  useEffect(() => {
    if (!session) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch approved participants
        const participantsRes = await fetch("/api/participants/approved", {
          headers: {
            "x-participant-id": session.id,
          },
        });

        if (!participantsRes.ok) {
          throw new Error("Failed to fetch participants");
        }

        const participantsData = await participantsRes.json();

        // Fetch existing selections
        const selectionsRes = await fetch("/api/selections", {
          headers: {
            "x-participant-id": session.id,
          },
        });

        if (!selectionsRes.ok) {
          throw new Error("Failed to fetch selections");
        }

        const selectionsData = await selectionsRes.json();

        setParticipants(participantsData.participants || []);
        setSelections(selectionsData.selections || []);

        // Build set of selected IDs
        const selectedSet = new Set<string>(
          selectionsData.selections?.map((s: Selection) => s.selected_id) || []
        );
        setSelectedIds(selectedSet);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session]);

  const handleToggleSelection = async (participant: Participant) => {
    if (!session) return;

    const isSelected = selectedIds.has(participant.id);

    try {
      setSubmitting(true);

      if (isSelected) {
        // Remove selection
        const selection = selections.find(
          (s) => s.selected_id === participant.id
        );
        if (!selection) return;

        const response = await fetch(`/api/selections/${selection.id}`, {
          method: "DELETE",
          headers: {
            "x-participant-id": session.id,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to remove selection");
        }

        // Update local state
        setSelectedIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(participant.id);
          return newSet;
        });
        setSelections((prev) =>
          prev.filter((s) => s.selected_id !== participant.id)
        );
      } else {
        // Add selection
        const response = await fetch("/api/selections", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-participant-id": session.id,
          },
          body: JSON.stringify({
            selected_participant_number: participant.participant_number,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to create selection");
        }

        const data = await response.json();

        // Update local state
        setSelectedIds((prev) => new Set(prev).add(participant.id));
        setSelections((prev) => [...prev, data.selection]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update selection");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQRScan = async (participantId: string, participantNumber: number) => {
    if (!session) return;

    try {
      setSubmitting(true);
      setError("");
      setScanSuccess("");

      // Add selection
      const response = await fetch("/api/selections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-participant-id": session.id,
        },
        body: JSON.stringify({
          selected_participant_number: participantNumber,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create selection");
      }

      const data = await response.json();

      // Update local state
      setSelectedIds((prev) => new Set(prev).add(participantId));
      setSelections((prev) => [...prev, data.selection]);

      // Show success message
      setScanSuccess(`Successfully selected participant #${participantNumber}!`);
      setTimeout(() => setScanSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add selection");
    } finally {
      setSubmitting(false);
    }
  };

  const handleScanError = (errorMsg: string) => {
    setError(errorMsg);
  };

  const handleLogout = () => {
    clearParticipantSession();
    router.push("/");
  };

  if (!session) {
    return null; // Will redirect
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2d3142] text-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2d3142] text-white p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Select Participants
            </h1>
            <p className="text-[#bfc0c0] mt-1">
              Welcome, {session.full_name} (#{session.participant_number})
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* Mode Tabs */}
        <div className="mb-6 flex gap-2 bg-[#3d4457] p-1 rounded-xl">
          <button
            onClick={() => setMode("grid")}
            className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all ${
              mode === "grid"
                ? "bg-[#ef8354] text-white shadow-lg"
                : "text-[#bfc0c0] hover:text-white"
            }`}
          >
            Number Grid
          </button>
          <button
            onClick={() => setMode("scanner")}
            className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all ${
              mode === "scanner"
                ? "bg-[#ef8354] text-white shadow-lg"
                : "text-[#bfc0c0] hover:text-white"
            }`}
          >
            QR Scanner
          </button>
        </div>

        {error && (
          <div className="mb-6">
            <ErrorMessage
              message={error}
              onRetry={() => window.location.reload()}
            />
          </div>
        )}

        {scanSuccess && (
          <div className="mb-6 bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
            <p className="text-green-400 text-sm text-center font-semibold">
              {scanSuccess}
            </p>
          </div>
        )}

        {/* Number Grid Mode */}
        {mode === "grid" && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Tap a number to select</CardTitle>
            <p className="text-sm text-[#bfc0c0] mt-2">
              Select as many participants as you&apos;re interested in
            </p>
          </CardHeader>
          <CardContent>
            {participants.length === 0 ? (
              <p className="text-center text-gray-400 py-8">
                No participants available yet
              </p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {participants.map((participant) => {
                  const isSelected = selectedIds.has(participant.id);
                  return (
                    <button
                      key={participant.id}
                      onClick={() => handleToggleSelection(participant)}
                      disabled={submitting}
                      className={`
                        relative aspect-square rounded-xl font-bold text-lg
                        transition-all duration-200 transform hover:scale-105
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${
                          isSelected
                            ? "bg-[#ef8354] text-white shadow-lg shadow-[#ef8354]/50"
                            : "bg-[#3d4457] text-[#bfc0c0] hover:bg-[#4f5d75]"
                        }
                      `}
                      title={`${participant.full_name} (${participant.gender})`}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        {participant.participant_number}
                      </div>
                      {isSelected && (
                        <div className="absolute top-1 right-1">
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
        )}

        {/* QR Scanner Mode */}
        {mode === "scanner" && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Scan QR Code</CardTitle>
              <p className="text-sm text-[#bfc0c0] mt-2">
                Point your camera at another participant&apos;s QR code
              </p>
            </CardHeader>
            <CardContent>
              <QRScanner
                onScan={handleQRScan}
                onError={handleScanError}
                isScanning={submitting}
              />
            </CardContent>
          </Card>
        )}

        {/* Selection Summary */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">
                  {selectedIds.size} participant{selectedIds.size !== 1 ? "s" : ""} selected
                </p>
                <p className="text-sm text-gray-400">
                  Your selections are saved automatically
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={() => router.push("/my-selections")}
              >
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
