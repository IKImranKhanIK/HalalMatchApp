"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import {
  saveParticipantSession,
  getParticipantSession,
} from "@/lib/auth/participant-session";

export default function LoginPage() {
  const router = useRouter();
  const [participantNumber, setParticipantNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    const session = getParticipantSession();
    if (session) {
      router.push("/select");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/participants/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          participant_number: parseInt(participantNumber),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Save session
      saveParticipantSession({
        id: data.participant.id,
        participant_number: data.participant.participant_number,
        full_name: data.participant.full_name,
        gender: data.participant.gender,
      });

      // Redirect to selection
      router.push("/select");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2d3142] text-white flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-xs mx-auto">
        <Card padding="sm">
          <CardHeader>
            <CardTitle>Participant Login</CardTitle>
            <p className="text-center text-[#bfc0c0] text-sm mt-2">
              Enter your participant number to continue
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <Input
                label="Participant Number"
                name="participant_number"
                type="number"
                value={participantNumber}
                onChange={(e) => setParticipantNumber(e.target.value)}
                placeholder="Enter your number (e.g., 1001)"
                required
                disabled={loading}
              />

              <Button
                type="submit"
                fullWidth
                loading={loading}
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>

              <div className="text-center">
                <p className="text-sm text-[#bfc0c0]">
                  Don&apos;t have a participant number?{" "}
                  <button
                    type="button"
                    onClick={() => router.push("/register")}
                    className="text-[#ef8354] hover:text-[#f0925e] underline"
                  >
                    Register here
                  </button>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
