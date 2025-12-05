"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorMessage from "@/components/shared/ErrorMessage";

interface Participant {
  id: string;
  participant_number: number;
  full_name: string;
  email: string;
  phone: string;
  gender: string;
  background_check_status: string;
  created_at: string;
}

export default function AdminParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [filteredParticipants, setFilteredParticipants] = useState<
    Participant[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchParticipants();
  }, []);

  useEffect(() => {
    filterParticipants();
  }, [participants, searchTerm, statusFilter]);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/participants");

      if (!response.ok) {
        throw new Error("Failed to fetch participants");
      }

      const data = await response.json();
      setParticipants(data.participants || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load participants");
    } finally {
      setLoading(false);
    }
  };

  const filterParticipants = () => {
    let filtered = [...participants];

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (p) => p.background_check_status === statusFilter
      );
    }

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.full_name.toLowerCase().includes(term) ||
          p.email.toLowerCase().includes(term) ||
          p.participant_number.toString().includes(term)
      );
    }

    setFilteredParticipants(filtered);
  };

  const updateBackgroundCheck = async (
    participantId: string,
    newStatus: string
  ) => {
    try {
      setUpdating(participantId);

      const response = await fetch(`/api/admin/participants/${participantId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          background_check_status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update participant");
      }

      // Update local state
      setParticipants((prev) =>
        prev.map((p) =>
          p.id === participantId
            ? { ...p, background_check_status: newStatus }
            : p
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const deleteParticipant = async (participantId: string, participantName: string) => {
    if (!confirm(`Are you sure you want to delete ${participantName}? This will also delete all their selections. This cannot be undone!`)) {
      return;
    }

    try {
      setDeleting(participantId);
      setError("");

      const response = await fetch(`/api/admin/participants/${participantId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete participant");
      }

      // Remove from local state
      setParticipants((prev) => prev.filter((p) => p.id !== participantId));
      alert("Participant deleted successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete participant");
    } finally {
      setDeleting(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      approved: "bg-green-500/10 text-green-500 border-green-500/20",
      rejected: "bg-red-500/10 text-red-500 border-red-500/20",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium border ${
          colors[status as keyof typeof colors] || colors.pending
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
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
      <div>
        <h1 className="text-3xl font-bold">Participants</h1>
        <p className="text-[#bfc0c0] mt-1">
          Manage participant registrations and background checks
        </p>
      </div>

      {error && (
        <ErrorMessage message={error} onRetry={fetchParticipants} />
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Search"
              placeholder="Search by name, email, or number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select
              label="Background Check Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "all", label: "All Statuses" },
                { value: "pending", label: "Pending" },
                { value: "approved", label: "Approved" },
                { value: "rejected", label: "Rejected" },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-[#bfc0c0]">
        Showing {filteredParticipants.length} of {participants.length}{" "}
        participants
      </div>

      {/* Participants Table */}
      <Card>
        <CardContent className="p-0">
          {filteredParticipants.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#bfc0c0]">No participants found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-[#4f5d75]">
                  <tr className="text-left text-sm text-[#bfc0c0]">
                    <th className="p-4 font-medium">#</th>
                    <th className="p-4 font-medium">Name</th>
                    <th className="p-4 font-medium">Email</th>
                    <th className="p-4 font-medium">Phone</th>
                    <th className="p-4 font-medium">Gender</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParticipants.map((participant) => (
                    <tr
                      key={participant.id}
                      className="border-b border-[#4f5d75] hover:bg-[#4f5d75]/20"
                    >
                      <td className="p-4 font-semibold">
                        {participant.participant_number}
                      </td>
                      <td className="p-4">{participant.full_name}</td>
                      <td className="p-4 text-sm text-[#bfc0c0]">
                        {participant.email}
                      </td>
                      <td className="p-4 text-sm text-[#bfc0c0]">
                        {participant.phone}
                      </td>
                      <td className="p-4 capitalize text-sm">
                        {participant.gender}
                      </td>
                      <td className="p-4">
                        {getStatusBadge(participant.background_check_status)}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          {participant.background_check_status !== "approved" && (
                            <Button
                              size="sm"
                              onClick={() =>
                                updateBackgroundCheck(participant.id, "approved")
                              }
                              disabled={updating === participant.id || deleting === participant.id}
                              loading={updating === participant.id}
                            >
                              Approve
                            </Button>
                          )}
                          {participant.background_check_status !== "rejected" && (
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() =>
                                updateBackgroundCheck(participant.id, "rejected")
                              }
                              disabled={updating === participant.id || deleting === participant.id}
                            >
                              Reject
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              deleteParticipant(participant.id, participant.full_name)
                            }
                            disabled={updating === participant.id || deleting === participant.id}
                            loading={deleting === participant.id}
                            className="bg-red-500/20 hover:bg-red-500/30 border-red-500/30"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
