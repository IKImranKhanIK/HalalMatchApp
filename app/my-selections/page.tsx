"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorMessage from "@/components/shared/ErrorMessage";
import {
  getParticipantSession,
  clearParticipantSession,
} from "@/lib/auth/participant-session";

interface Selection {
  id: string;
  selected_id: string;
  created_at: string;
  participants: {
    participant_number: number;
    full_name: string;
    gender: string;
  };
}

export default function MySelectionsPage() {
  const router = useRouter();
  const [session, setSession] = useState(getParticipantSession());
  const [selections, setSelections] = useState<Selection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState<string | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!session) {
      router.push("/login");
    }
  }, [session, router]);

  // Fetch selections
  useEffect(() => {
    if (!session) return;

    const fetchSelections = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/selections", {
          headers: {
            "x-participant-id": session.id,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch selections");
        }

        const data = await response.json();
        setSelections(data.selections || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load selections");
      } finally {
        setLoading(false);
      }
    };

    fetchSelections();
  }, [session]);

  const handleRemoveSelection = async (selectionId: string) => {
    if (!session) return;

    try {
      setRemoving(selectionId);

      const response = await fetch(`/api/selections/${selectionId}`, {
        method: "DELETE",
        headers: {
          "x-participant-id": session.id,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to remove selection");
      }

      // Update local state
      setSelections((prev) => prev.filter((s) => s.id !== selectionId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove selection");
    } finally {
      setRemoving(null);
    }
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">My Selections</h1>
            <p className="text-[#bfc0c0] mt-1">
              {session.full_name} (#{session.participant_number})
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {error && (
          <div className="mb-6">
            <ErrorMessage
              message={error}
              onRetry={() => window.location.reload()}
            />
          </div>
        )}

        {/* Back Button */}
        <div className="mb-6">
          <Button variant="secondary" onClick={() => router.push("/select")}>
            ← Back to Selection
          </Button>
        </div>

        {/* Selections List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selections.length} Selection{selections.length !== 1 ? "s" : ""}
            </CardTitle>
            <p className="text-sm text-[#bfc0c0] mt-2">
              People you&apos;ve selected
            </p>
          </CardHeader>
          <CardContent>
            {selections.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[#bfc0c0] mb-4">
                  You haven&apos;t selected anyone yet
                </p>
                <Button onClick={() => router.push("/select")}>
                  Start Selecting
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {selections.map((selection) => (
                  <div
                    key={selection.id}
                    className="bg-[#3d4457] rounded-2xl p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#ef8354] flex items-center justify-center font-bold text-lg shadow-lg">
                        {selection.participants.participant_number}
                      </div>
                      <div>
                        <p className="font-semibold">
                          {selection.participants.full_name}
                        </p>
                        <p className="text-sm text-[#bfc0c0] capitalize">
                          {selection.participants.gender}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRemoveSelection(selection.id)}
                      disabled={removing === selection.id}
                      loading={removing === selection.id}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        {selections.length > 0 && (
          <Card className="mt-6">
            <CardContent>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
                <p className="text-sm text-blue-300">
                  <strong>Note:</strong> Your selections are private. The event
                  organizer will only share mutual matches after the event.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
