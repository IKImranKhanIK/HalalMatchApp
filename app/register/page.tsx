"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import Image from "next/image";
import { saveParticipantSession } from "@/lib/auth/participant-session";
import Logo from "@/components/shared/Logo";

interface RegistrationSuccess {
  id: string;
  participant_number: number;
  full_name: string;
  email: string;
  qr_code: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    participant_number: "",
    full_name: "",
    email: "",
    phone: "",
    gender: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<RegistrationSuccess | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError(""); // Clear error on input change
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/participants/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          participant_number: parseInt(formData.participant_number),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Show success with QR code
      setSuccess(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSuccess(null);
    setFormData({
      participant_number: "",
      full_name: "",
      email: "",
      phone: "",
      gender: "",
    });
  };

  const handleGoToSelection = () => {
    if (!success) return;

    // Save session to localStorage
    saveParticipantSession({
      id: success.id,
      participant_number: success.participant_number,
      full_name: success.full_name,
      gender: formData.gender,
    });

    // Redirect to selection interface
    router.push("/select");
  };

  // Success view with QR code
  if (success) {
    return (
      <div className="min-h-screen bg-[#2d3142] text-white flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-xs mx-auto">
          <Card padding="sm">
            <CardHeader>
              <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-[#ef8354]/10 mx-auto">
                <svg
                  className="w-6 h-6 text-[#ef8354]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <CardTitle>Registration Successful!</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-4 text-center">
                <div>
                  <p className="text-[#bfc0c0] mb-2">Your Participant Number</p>
                  <p className="text-4xl font-bold text-[#ef8354]">
                    #{success.participant_number}
                  </p>
                  <p className="text-sm text-[#bfc0c0]/70 mt-2">
                    Please remember this number
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl inline-block">
                  <Image
                    src={success.qr_code}
                    alt="Your QR Code"
                    width={250}
                    height={250}
                    className="mx-auto"
                  />
                </div>

                <div className="text-left space-y-2 bg-gray-800 p-4 rounded-2xl">
                  <p className="text-sm text-gray-400">
                    <span className="font-semibold">Name:</span>{" "}
                    {success.full_name}
                  </p>
                  <p className="text-sm text-gray-400">
                    <span className="font-semibold">Email:</span>{" "}
                    {success.email}
                  </p>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 text-left">
                  <p className="text-sm text-blue-300">
                    📱 <strong>Next Steps:</strong>
                  </p>
                  <ul className="text-sm text-blue-200 mt-2 space-y-1 ml-4">
                    <li>• Save or screenshot this QR code</li>
                    <li>• Bring it to the event</li>
                    <li>• Your background check status will be updated soon</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <Button fullWidth onClick={handleGoToSelection}>
                    Start Selecting Participants
                  </Button>
                  <div className="flex gap-3">
                    <Button
                      variant="secondary"
                      fullWidth
                      onClick={() => window.print()}
                    >
                      Print QR Code
                    </Button>
                    <Button variant="ghost" fullWidth onClick={handleReset}>
                      Register Another
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Registration form
  return (
    <div className="min-h-screen bg-[#2d3142] text-white flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-xs mx-auto space-y-6">
        <div className="flex justify-center">
          <Logo size="md" />
        </div>
        <Card padding="sm">
          <CardHeader>
            <CardTitle>Participant Registration</CardTitle>
            <p className="text-center text-[#bfc0c0] text-sm mt-2">
              Register for the Halal Match Event
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
                min="1"
                value={formData.participant_number}
                onChange={handleChange}
                placeholder="Enter your assigned number"
                required
                disabled={loading}
              />

              <Input
                label="Full Name"
                name="full_name"
                type="text"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                disabled={loading}
              />

              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                required
                disabled={loading}
              />

              <Input
                label="Phone Number"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(555) 123-4567"
                required
                disabled={loading}
              />

              <Select
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                options={[
                  { value: "", label: "Select Gender" },
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                ]}
                required
                disabled={loading}
              />

              <Button
                type="submit"
                fullWidth
                loading={loading}
                disabled={loading}
                className="mt-6"
              >
                {loading ? "Registering..." : "Register"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-[#bfc0c0]/60 text-xs">
          Built by{" "}
          <a
            href="https://www.linkedin.com/in/imran-khan-728077130/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#ef8354] hover:text-[#f0925e] transition-colors"
          >
            @Imran Khan
          </a>
        </p>
      </div>
    </div>
  );
}
