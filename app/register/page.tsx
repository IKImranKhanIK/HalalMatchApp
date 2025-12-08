"use client";

// React hooks for component state and lifecycle management
import { useState } from "react";
// Next.js router for client-side navigation
import { useRouter } from "next/navigation";
// UI components for card layout and structure
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
// Form input components for user data entry
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
// Loading spinner component for async operations
import LoadingSpinner from "@/components/shared/LoadingSpinner";
// Session management utility for storing participant data
import { saveParticipantSession } from "@/lib/auth/participant-session";
// Logo component for branding
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
    age: "",
    occupation: "",
    customOccupation: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<RegistrationSuccess | null>(null);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const phoneNumber = value.replace(/\D/g, '');

    // Format based on length
    if (phoneNumber.length <= 3) {
      return phoneNumber;
    } else if (phoneNumber.length <= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    } else {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    }
  };

  const capitalizeName = (value: string) => {
    // Capitalize first letter of each word
    return value
      .split(' ')
      .map(word => {
        if (word.length === 0) return word;
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Format phone number as user types
    if (name === 'phone') {
      const formatted = formatPhoneNumber(value);
      setFormData((prev) => ({
        ...prev,
        phone: formatted,
      }));
    }
    // Capitalize full name as user types
    else if (name === 'full_name') {
      const capitalized = capitalizeName(value);
      setFormData((prev) => ({
        ...prev,
        full_name: capitalized,
      }));
    }
    else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    setError(""); // Clear error on input change
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Use custom occupation if "Other" is selected
      const finalOccupation = formData.occupation === "other"
        ? formData.customOccupation
        : formData.occupation;

      const response = await fetch("/api/participants/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          participant_number: parseInt(formData.participant_number),
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone.replace(/\D/g, ''), // Strip formatting for API
          gender: formData.gender,
          age: parseInt(formData.age),
          occupation: finalOccupation,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors with details
        if (data.details) {
          const errorMessages = Object.entries(data.details)
            .map(([field, messages]) => {
              const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
              return `${fieldName}: ${(messages as string[]).join(', ')}`;
            })
            .join('\n');
          throw new Error(errorMessages || data.error || "Registration failed");
        }
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

  // handleReset function removed - "Register Another" button no longer needed
  // Users can navigate back to registration page if they need to register another participant

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
                {/* Display the assigned participant number prominently */}
                <div>
                  {/* Label for participant number */}
                  <p className="text-[#bfc0c0] mb-2">Your Participant Number</p>
                  {/* Large, bold display of the participant number in brand color */}
                  <p className="text-4xl font-bold text-[#ef8354]">
                    #{success.participant_number}
                  </p>
                  {/* Reminder text to help participant remember their number */}
                  <p className="text-sm text-[#bfc0c0]/70 mt-2">
                    Please remember this number
                  </p>
                </div>

                {/* Participant details section with dark background for contrast */}
                <div className="text-left space-y-2 bg-gray-800 p-4 rounded-2xl">
                  {/* Display participant name - capitalize first letter for proper formatting */}
                  <p className="text-sm text-gray-400">
                    <span className="font-semibold">Name:</span>{" "}
                    {/* Capitalize the first character of the full name */}
                    {success.full_name.charAt(0).toUpperCase() + success.full_name.slice(1)}
                  </p>
                  {/* Display participant email address */}
                  <p className="text-sm text-gray-400">
                    <span className="font-semibold">Email:</span>{" "}
                    {success.email}
                  </p>
                </div>

                {/* Next steps information box with blue theme */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 text-left">
                  {/* Next steps header with icon */}
                  <p className="text-sm text-blue-300">
                    📱 <strong>Next Steps:</strong>
                  </p>
                  {/* List of instructions for the participant */}
                  <ul className="text-sm text-blue-200 mt-2 space-y-1 ml-4">
                    {/* Inform about background check process */}
                    <li>• Your background check status will be updated soon</li>
                    {/* Instruction to use participant number for login */}
                    <li>• Use your participant number to log in</li>
                    {/* Remind to bring number to the event */}
                    <li>• Bring your participant number to the event</li>
                  </ul>
                </div>

                {/* Action button section */}
                <div className="space-y-3">
                  {/* Primary action button to proceed to participant selection */}
                  <Button fullWidth onClick={handleGoToSelection}>
                    Start Selecting Participants
                  </Button>
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
                  <p className="text-red-400 text-sm whitespace-pre-line">{error}</p>
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

              <Input
                label="Age"
                name="age"
                type="number"
                min="18"
                max="120"
                value={formData.age}
                onChange={handleChange}
                placeholder="Enter your age"
                required
                disabled={loading}
              />

              <Select
                label="Occupation/Industry"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                options={[
                  { value: "", label: "Select Occupation" },
                  { value: "healthcare", label: "Healthcare" },
                  { value: "education", label: "Education" },
                  { value: "technology", label: "Technology/IT" },
                  { value: "business", label: "Business/Finance" },
                  { value: "engineering", label: "Engineering" },
                  { value: "law", label: "Law/Legal" },
                  { value: "arts", label: "Arts/Media" },
                  { value: "government", label: "Government/Public Service" },
                  { value: "retail", label: "Retail/Sales" },
                  { value: "hospitality", label: "Hospitality/Tourism" },
                  { value: "construction", label: "Construction/Trades" },
                  { value: "student", label: "Student" },
                  { value: "other", label: "Other" },
                ]}
                required
                disabled={loading}
              />

              {formData.occupation === "other" && (
                <Input
                  label="Please specify your occupation"
                  name="customOccupation"
                  type="text"
                  value={formData.customOccupation}
                  onChange={handleChange}
                  placeholder="Enter your occupation"
                  required
                  disabled={loading}
                />
              )}

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
