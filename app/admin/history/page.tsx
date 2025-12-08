"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorMessage from "@/components/shared/ErrorMessage";

interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  description: string;
  status: string;
  created_at: string;
}

interface EventWithStats extends Event {
  participantCount: number;
  selectionCount: number;
  mutualMatchCount: number;
  maleCount: number;
  femaleCount: number;
}

export default function AdminHistoryPage() {
  const [events, setEvents] = useState<EventWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch all events
      const eventsResponse = await fetch("/api/admin/events");
      if (!eventsResponse.ok) throw new Error("Failed to fetch events");

      const eventsData = await eventsResponse.json();
      setEvents(eventsData.events || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: "bg-green-500/20 text-green-400 border-green-500/30",
      ongoing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      upcoming: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium border ${
          styles[status as keyof typeof styles] || styles.upcoming
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
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Event History</h1>
          <p className="text-[#bfc0c0] mt-1">
            View all past and upcoming matchmaking events
          </p>
        </div>
        <Button onClick={() => window.location.href = "/admin/events"}>
          Manage Events
        </Button>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchEvents} />}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-[#bfc0c0]">Total Events</p>
                <p className="text-2xl font-bold">{events.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

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
                <p className="text-sm text-[#bfc0c0]">Total Participants</p>
                <p className="text-2xl font-bold">
                  {events.reduce((sum, e) => sum + e.participantCount, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-purple-400"
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
                <p className="text-2xl font-bold">
                  {events.reduce((sum, e) => sum + e.selectionCount, 0)}
                </p>
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
                <p className="text-sm text-[#bfc0c0]">Total Matches</p>
                <p className="text-2xl font-bold">
                  {events.reduce((sum, e) => sum + e.mutualMatchCount, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {events.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-[#bfc0c0]">No events found</p>
              <Button
                className="mt-4"
                onClick={() => window.location.href = "/admin/events"}
              >
                Create First Event
              </Button>
            </CardContent>
          </Card>
        ) : (
          events.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              <div
                className="p-6 cursor-pointer hover:bg-[#3d4457] transition-colors"
                onClick={() =>
                  setExpandedEvent(expandedEvent === event.id ? null : event.id)
                }
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold">{event.name}</h2>
                      {getStatusBadge(event.status)}
                    </div>
                    <div className="flex items-center gap-6 text-[#bfc0c0] text-sm mb-3">
                      <div className="flex items-center gap-2">
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
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="font-medium">{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
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
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span>{event.location}</span>
                      </div>
                    </div>
                    {event.description && (
                      <p className="text-[#bfc0c0] text-sm mb-4">
                        {event.description}
                      </p>
                    )}

                    {/* Quick Stats */}
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-[#2b2d42] p-3 rounded-lg">
                        <p className="text-xs text-[#bfc0c0] mb-1">Participants</p>
                        <p className="text-xl font-bold">{event.participantCount}</p>
                        <p className="text-xs text-[#bfc0c0] mt-1">
                          {event.maleCount}M / {event.femaleCount}F
                        </p>
                      </div>
                      <div className="bg-[#2b2d42] p-3 rounded-lg">
                        <p className="text-xs text-[#bfc0c0] mb-1">Selections</p>
                        <p className="text-xl font-bold">{event.selectionCount}</p>
                      </div>
                      <div className="bg-[#2b2d42] p-3 rounded-lg">
                        <p className="text-xs text-[#bfc0c0] mb-1">Matches</p>
                        <p className="text-xl font-bold text-pink-400">
                          {event.mutualMatchCount}
                        </p>
                      </div>
                      <div className="bg-[#2b2d42] p-3 rounded-lg">
                        <p className="text-xs text-[#bfc0c0] mb-1">Success Rate</p>
                        <p className="text-xl font-bold text-green-400">
                          {event.selectionCount > 0
                            ? ((event.mutualMatchCount / event.selectionCount) * 100).toFixed(0)
                            : 0}
                          %
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="ml-4">
                    <svg
                      className={`w-6 h-6 text-[#bfc0c0] transition-transform ${
                        expandedEvent === event.id ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedEvent === event.id && (
                <div className="border-t border-[#4f5d75] p-6 bg-[#2b2d42]">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        window.location.href = `/admin/participants?event=${event.id}`
                      }
                    >
                      View Participants
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        window.location.href = `/admin/selections?event=${event.id}`
                      }
                    >
                      View Selections
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        // Export event data
                        window.location.href = `/api/admin/export?event=${event.id}`;
                      }}
                    >
                      Export Event Data
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
