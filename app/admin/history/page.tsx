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
  gender: string;
  age?: number;
  occupation?: string;
  background_check_status: string;
  created_at: string;
}

interface Selection {
  id: string;
  created_at: string;
  is_mutual: boolean;
  selector: {
    participant_number: number;
    full_name: string;
    gender: string;
  };
  selected: {
    participant_number: number;
    full_name: string;
    gender: string;
  };
}

interface HistoryEvent {
  id: string;
  type: "registration" | "selection" | "mutual_match";
  timestamp: string;
  data: any;
}

export default function AdminHistoryPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selections, setSelections] = useState<Selection[]>([]);
  const [historyEvents, setHistoryEvents] = useState<HistoryEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<HistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("all");
  const [dateRangeFilter, setDateRangeFilter] = useState("all");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [historyEvents, searchTerm, eventTypeFilter, dateRangeFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch participants and selections in parallel
      const [participantsRes, selectionsRes] = await Promise.all([
        fetch("/api/admin/participants"),
        fetch("/api/admin/selections"),
      ]);

      if (!participantsRes.ok || !selectionsRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const participantsData = await participantsRes.json();
      const selectionsData = await selectionsRes.json();

      setParticipants(participantsData.participants || []);
      setSelections(selectionsData.selections || []);

      // Build history events
      buildHistoryEvents(
        participantsData.participants || [],
        selectionsData.selections || []
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const buildHistoryEvents = (
    participants: Participant[],
    selections: Selection[]
  ) => {
    const events: HistoryEvent[] = [];

    // Add registration events
    participants.forEach((p) => {
      events.push({
        id: `reg-${p.id}`,
        type: "registration",
        timestamp: p.created_at,
        data: p,
      });
    });

    // Add selection events
    selections.forEach((s) => {
      if (s.is_mutual) {
        events.push({
          id: `match-${s.id}`,
          type: "mutual_match",
          timestamp: s.created_at,
          data: s,
        });
      } else {
        events.push({
          id: `sel-${s.id}`,
          type: "selection",
          timestamp: s.created_at,
          data: s,
        });
      }
    });

    // Sort by timestamp (newest first)
    events.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    setHistoryEvents(events);
  };

  const filterEvents = () => {
    let filtered = [...historyEvents];

    // Filter by event type
    if (eventTypeFilter !== "all") {
      filtered = filtered.filter((e) => e.type === eventTypeFilter);
    }

    // Filter by date range
    if (dateRangeFilter !== "all") {
      const now = new Date();
      const filterDate = new Date();

      switch (dateRangeFilter) {
        case "today":
          filterDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          filterDate.setDate(now.getDate() - 7);
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }

      filtered = filtered.filter(
        (e) => new Date(e.timestamp) >= filterDate
      );
    }

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((e) => {
        if (e.type === "registration") {
          const p = e.data as Participant;
          return (
            p.full_name.toLowerCase().includes(term) ||
            p.email.toLowerCase().includes(term) ||
            p.participant_number.toString().includes(term)
          );
        } else {
          const s = e.data as Selection;
          return (
            s.selector.full_name.toLowerCase().includes(term) ||
            s.selected.full_name.toLowerCase().includes(term) ||
            s.selector.participant_number.toString().includes(term) ||
            s.selected.participant_number.toString().includes(term)
          );
        }
      });
    }

    setFilteredEvents(filtered);
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "registration":
        return (
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
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
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
        );
      case "selection":
        return (
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-blue-400"
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
        );
      case "mutual_match":
        return (
          <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-pink-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const renderEventContent = (event: HistoryEvent) => {
    switch (event.type) {
      case "registration": {
        const p = event.data as Participant;
        return (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">New Registration</h3>
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium ${
                  p.background_check_status === "approved"
                    ? "bg-green-500/10 text-green-400"
                    : p.background_check_status === "rejected"
                    ? "bg-red-500/10 text-red-400"
                    : "bg-yellow-500/10 text-yellow-400"
                }`}
              >
                {p.background_check_status}
              </span>
            </div>
            <p className="text-sm text-[#bfc0c0]">
              <span className="font-medium text-white">#{p.participant_number}</span> -{" "}
              {p.full_name} ({p.gender}, {p.age || "N/A"})
            </p>
            <p className="text-xs text-[#bfc0c0] mt-1">
              {p.email} • {p.occupation || "N/A"}
            </p>
          </div>
        );
      }
      case "selection": {
        const s = event.data as Selection;
        return (
          <div>
            <h3 className="font-semibold mb-1">New Selection</h3>
            <p className="text-sm text-[#bfc0c0]">
              <span className="font-medium text-white">
                #{s.selector.participant_number} {s.selector.full_name}
              </span>{" "}
              selected{" "}
              <span className="font-medium text-white">
                #{s.selected.participant_number} {s.selected.full_name}
              </span>
            </p>
          </div>
        );
      }
      case "mutual_match": {
        const s = event.data as Selection;
        return (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-pink-400">🎉 Mutual Match!</h3>
            </div>
            <p className="text-sm text-[#bfc0c0]">
              <span className="font-medium text-white">
                #{s.selector.participant_number} {s.selector.full_name}
              </span>{" "}
              ↔️{" "}
              <span className="font-medium text-white">
                #{s.selected.participant_number} {s.selected.full_name}
              </span>
            </p>
          </div>
        );
      }
      default:
        return null;
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
      <div>
        <h1 className="text-3xl font-bold">History & Activity Log</h1>
        <p className="text-[#bfc0c0] mt-1">
          Complete timeline of all registrations, selections, and matches
        </p>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchData} />}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-[#bfc0c0]">Total Registrations</p>
                <p className="text-2xl font-bold">{participants.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-[#bfc0c0]">Total Selections</p>
                <p className="text-2xl font-bold">{selections.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-pink-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-[#bfc0c0]">Mutual Matches</p>
                <p className="text-2xl font-bold">
                  {selections.filter((s) => s.is_mutual).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Search"
              placeholder="Search by name, email, or number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select
              label="Event Type"
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              options={[
                { value: "all", label: "All Events" },
                { value: "registration", label: "Registrations" },
                { value: "selection", label: "Selections" },
                { value: "mutual_match", label: "Mutual Matches" },
              ]}
            />
            <Select
              label="Time Period"
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value)}
              options={[
                { value: "all", label: "All Time" },
                { value: "today", label: "Today" },
                { value: "week", label: "Last 7 Days" },
                { value: "month", label: "Last 30 Days" },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-[#bfc0c0]">
        Showing {filteredEvents.length} of {historyEvents.length} events
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#bfc0c0]">No events found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEvents.map((event, index) => (
                <div key={event.id} className="flex gap-4">
                  {/* Timeline dot */}
                  <div className="relative flex flex-col items-center">
                    {getEventIcon(event.type)}
                    {index < filteredEvents.length - 1 && (
                      <div className="w-0.5 h-full bg-[#4f5d75] mt-2"></div>
                    )}
                  </div>

                  {/* Event content */}
                  <div className="flex-1 pb-8">
                    <div className="bg-[#2b2d42] p-4 rounded-xl border border-[#4f5d75] hover:border-[#8d99ae] transition-colors">
                      {renderEventContent(event)}
                      <p className="text-xs text-[#bfc0c0] mt-2">
                        {formatTimestamp(event.timestamp)} •{" "}
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
