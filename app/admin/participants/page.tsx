"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorMessage from "@/components/shared/ErrorMessage";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Toast from "@/components/ui/Toast";

interface Participant {
  id: string;
  participant_number: number;
  full_name: string;
  email: string;
  phone: string;
  gender: string;
  age?: number;
  occupation?: string;
  background_check_status: string;
  created_at: string;
}

interface ToastState {
  message: string;
  type: "success" | "error" | "info";
}

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  variant?: "danger" | "warning" | "info";
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

export default function AdminParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [filteredParticipants, setFilteredParticipants] = useState<
    Participant[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [ageRangeFilter, setAgeRangeFilter] = useState("all");
  const [occupationFilter, setOccupationFilter] = useState("all");
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(new Set());
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    fetchParticipants();
  }, []);

  useEffect(() => {
    filterParticipants();
  }, [participants, searchTerm, statusFilter, genderFilter, ageRangeFilter, occupationFilter]);

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

    // Filter by gender
    if (genderFilter !== "all") {
      filtered = filtered.filter((p) => p.gender === genderFilter);
    }

    // Filter by age range
    if (ageRangeFilter !== "all" && ageRangeFilter) {
      const [min, max] = ageRangeFilter.split("-").map(Number);
      filtered = filtered.filter((p) => {
        if (!p.age) return false;
        if (max) {
          return p.age >= min && p.age <= max;
        }
        return p.age >= min; // For "60+" range
      });
    }

    // Filter by occupation
    if (occupationFilter !== "all") {
      filtered = filtered.filter((p) =>
        p.occupation?.toLowerCase().includes(occupationFilter.toLowerCase())
      );
    }

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.full_name.toLowerCase().includes(term) ||
          p.email.toLowerCase().includes(term) ||
          p.participant_number.toString().includes(term) ||
          p.occupation?.toLowerCase().includes(term) ||
          p.phone.includes(term)
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

  const deleteParticipant = (participantId: string, participantName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Participant?",
      message: `Are you sure you want to delete ${participantName}? This will also delete all their selections. This action cannot be undone!`,
      variant: "danger",
      onConfirm: async () => {
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
          setConfirmDialog(null);
          setToast({
            message: "Participant deleted successfully",
            type: "success",
          });
        } catch (err) {
          setConfirmDialog(null);
          setToast({
            message: err instanceof Error ? err.message : "Failed to delete participant",
            type: "error",
          });
        } finally {
          setDeleting(null);
        }
      },
    });
  };

  // Bulk Actions
  const toggleSelectAll = () => {
    if (selectedParticipants.size === filteredParticipants.length) {
      setSelectedParticipants(new Set());
    } else {
      setSelectedParticipants(new Set(filteredParticipants.map((p) => p.id)));
    }
  };

  const toggleSelectParticipant = (id: string) => {
    const newSelected = new Set(selectedParticipants);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedParticipants(newSelected);
  };

  const bulkUpdateStatus = async (newStatus: string) => {
    if (selectedParticipants.size === 0) return;

    setConfirmDialog({
      isOpen: true,
      title: `${newStatus === "approved" ? "Approve" : "Reject"} ${selectedParticipants.size} Participant(s)?`,
      message: `Are you sure you want to ${newStatus} ${selectedParticipants.size} selected participant(s)?`,
      variant: newStatus === "approved" ? "info" : "warning",
      onConfirm: async () => {
        try {
          setBulkUpdating(true);
          setConfirmDialog(null);

          const updatePromises = Array.from(selectedParticipants).map((id) =>
            fetch(`/api/admin/participants/${id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ background_check_status: newStatus }),
            })
          );

          await Promise.all(updatePromises);

          // Update local state
          setParticipants((prev) =>
            prev.map((p) =>
              selectedParticipants.has(p.id)
                ? { ...p, background_check_status: newStatus }
                : p
            )
          );

          setSelectedParticipants(new Set());
          setToast({
            message: `Successfully ${newStatus} ${selectedParticipants.size} participant(s)`,
            type: "success",
          });
        } catch (err) {
          setToast({
            message: err instanceof Error ? err.message : "Failed to update participants",
            type: "error",
          });
        } finally {
          setBulkUpdating(false);
        }
      },
    });
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

  // Quick Action: Select all pending
  const selectAllPending = () => {
    const pendingIds = filteredParticipants
      .filter((p) => p.background_check_status === "pending")
      .map((p) => p.id);
    setSelectedParticipants(new Set(pendingIds));
  };

  // Quick Action: Approve all pending (one-click)
  const approveAllPending = () => {
    const pendingParticipants = participants.filter(
      (p) => p.background_check_status === "pending"
    );

    if (pendingParticipants.length === 0) {
      setToast({
        message: "No pending participants to approve",
        type: "info",
      });
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: `Approve All ${pendingParticipants.length} Pending Participant(s)?`,
      message: `This will approve all pending participants in one action. Are you sure?`,
      variant: "info",
      onConfirm: async () => {
        try {
          setBulkUpdating(true);
          setConfirmDialog(null);

          const updatePromises = pendingParticipants.map((p) =>
            fetch(`/api/admin/participants/${p.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ background_check_status: "approved" }),
            })
          );

          await Promise.all(updatePromises);

          setParticipants((prev) =>
            prev.map((p) =>
              p.background_check_status === "pending"
                ? { ...p, background_check_status: "approved" }
                : p
            )
          );

          setToast({
            message: `Successfully approved ${pendingParticipants.length} participant(s)`,
            type: "success",
          });
        } catch (err) {
          setToast({
            message: err instanceof Error ? err.message : "Failed to approve participants",
            type: "error",
          });
        } finally {
          setBulkUpdating(false);
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Participants</h1>
          <p className="text-[#bfc0c0] mt-1">
            Manage participant registrations and background checks
          </p>
        </div>
        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={selectAllPending}
            disabled={bulkUpdating || filteredParticipants.filter((p) => p.background_check_status === "pending").length === 0}
            title="Select all pending participants"
          >
            Select All Pending
          </Button>
          <Button
            size="sm"
            onClick={approveAllPending}
            disabled={bulkUpdating || participants.filter((p) => p.background_check_status === "pending").length === 0}
            loading={bulkUpdating}
            title="Approve all pending participants with one click"
          >
            ✓ Approve All Pending
          </Button>
        </div>
      </div>

      {error && (
        <ErrorMessage message={error} onRetry={fetchParticipants} />
      )}

      {/* Enhanced Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <Select
              label="Gender"
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              options={[
                { value: "all", label: "All Genders" },
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
              ]}
            />
            <Select
              label="Age Range"
              value={ageRangeFilter}
              onChange={(e) => setAgeRangeFilter(e.target.value)}
              options={[
                { value: "all", label: "All Ages" },
                { value: "18-25", label: "18-25" },
                { value: "26-35", label: "26-35" },
                { value: "36-45", label: "36-45" },
                { value: "46-60", label: "46-60" },
                { value: "60", label: "60+" },
              ]}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <Select
              label="Occupation"
              value={occupationFilter}
              onChange={(e) => setOccupationFilter(e.target.value)}
              options={[
                { value: "all", label: "All Occupations" },
                { value: "healthcare", label: "Healthcare" },
                { value: "education", label: "Education" },
                { value: "technology", label: "Technology" },
                { value: "business", label: "Business" },
                { value: "engineering", label: "Engineering" },
                { value: "law", label: "Law" },
                { value: "arts", label: "Arts" },
                { value: "government", label: "Government" },
                { value: "retail", label: "Retail" },
                { value: "hospitality", label: "Hospitality" },
                { value: "construction", label: "Construction" },
                { value: "student", label: "Student" },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Bar */}
      {selectedParticipants.size > 0 && (
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  {selectedParticipants.size} participant(s) selected
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => bulkUpdateStatus("approved")}
                  disabled={bulkUpdating}
                  loading={bulkUpdating}
                >
                  Bulk Approve
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => bulkUpdateStatus("rejected")}
                  disabled={bulkUpdating}
                >
                  Bulk Reject
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setSelectedParticipants(new Set())}
                  disabled={bulkUpdating}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                    <th className="p-4 font-medium">
                      <input
                        type="checkbox"
                        checked={selectedParticipants.size === filteredParticipants.length && filteredParticipants.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-[#4f5d75] bg-[#2b2d42] text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                      />
                    </th>
                    <th className="p-4 font-medium">#</th>
                    <th className="p-4 font-medium">Name</th>
                    <th className="p-4 font-medium">Email</th>
                    <th className="p-4 font-medium">Phone</th>
                    <th className="p-4 font-medium">Age</th>
                    <th className="p-4 font-medium">Occupation</th>
                    <th className="p-4 font-medium">Gender</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParticipants.map((participant) => (
                    <tr
                      key={participant.id}
                      className={`border-b border-[#4f5d75] hover:bg-[#4f5d75]/20 ${
                        selectedParticipants.has(participant.id) ? "bg-blue-500/10" : ""
                      }`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedParticipants.has(participant.id)}
                          onChange={() => toggleSelectParticipant(participant.id)}
                          className="w-4 h-4 rounded border-[#4f5d75] bg-[#2b2d42] text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                        />
                      </td>
                      <td className="p-4 font-semibold">
                        {participant.participant_number}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <GenderIcon gender={participant.gender} />
                          <span>{participant.full_name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-[#bfc0c0]">
                        {participant.email}
                      </td>
                      <td className="p-4 text-sm text-[#bfc0c0]">
                        {participant.phone}
                      </td>
                      <td className="p-4 text-sm text-[#bfc0c0]">
                        {participant.age || "N/A"}
                      </td>
                      <td className="p-4 text-sm text-[#bfc0c0] capitalize">
                        {participant.occupation || "N/A"}
                      </td>
                      <td className="p-4 capitalize text-sm">
                        <div className="flex items-center gap-2">
                          <GenderIcon gender={participant.gender} />
                          <span>{participant.gender}</span>
                        </div>
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

      {/* Confirm Dialog */}
      {confirmDialog && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          variant={confirmDialog.variant}
          onConfirm={confirmDialog.onConfirm}
          onClose={() => setConfirmDialog(null)}
        />
      )}

      {/* Toast */}
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
