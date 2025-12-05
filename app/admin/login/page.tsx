"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Logo from "@/components/shared/Logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin/dashboard";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        return;
      }

      if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2d3142] text-white flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-xs mx-auto space-y-6">
        <div className="flex justify-center">
          <Logo size="md" />
        </div>
        <Card padding="sm">
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
            <p className="text-center text-[#bfc0c0] text-sm mt-2">
              Sign in to access the admin dashboard
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
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@halalmatch.com"
                required
                disabled={loading}
              />

              <Input
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                disabled={loading}
              />

              <Button
                type="submit"
                fullWidth
                loading={loading}
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <p className="text-sm text-blue-300 text-center">
                <strong>Default credentials:</strong>
                <br />
                Email: admin@halalmatch.com
                <br />
                Password: admin123
              </p>
            </div>
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
