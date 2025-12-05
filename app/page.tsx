"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Logo from "@/components/shared/Logo";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#2d3142] text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#ef8354]/10 via-[#2d3142] to-[#2d3142]" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center space-y-6">
            <div className="flex justify-center mb-8">
              <Logo size="lg" />
            </div>
            <p className="text-xl sm:text-2xl text-[#bfc0c0] max-w-2xl mx-auto">
              Connect with like-minded individuals in a respectful, faith-centered environment
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link href="/register">
                <Button size="lg" className="min-w-[200px]">
                  Register Now
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="secondary" className="min-w-[200px]">
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
          How It Works
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-[#ef8354]/10 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-[#ef8354]">1</span>
              </div>
              <CardTitle>Register</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#bfc0c0]/80">
                Scan the QR code at the event and complete your registration.
                You&apos;ll receive a unique participant number.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-[#ef8354]/10 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-[#ef8354]">2</span>
              </div>
              <CardTitle>Connect</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#bfc0c0]/80">
                Meet and interact with other participants during the volunteer
                activities at the mosque.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-[#ef8354]/10 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-[#ef8354]">3</span>
              </div>
              <CardTitle>Select</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#bfc0c0]/80">
                Use the app to select participants you&apos;re interested in.
                You can select as many as you like - it&apos;s completely private.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-[#3d4457]/50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            Why Halal Match?
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-[#ef8354]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Background Checked</h3>
                <p className="text-[#bfc0c0]/80">
                  All participants undergo background checks for safety and peace of mind.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-[#ef8354]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Private & Secure</h3>
                <p className="text-[#bfc0c0]/80">
                  Your selections are completely private. Only mutual matches are revealed.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-[#ef8354]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">In-Person First</h3>
                <p className="text-[#bfc0c0]/80">
                  Meet people face-to-face during volunteer activities before making selections.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-[#ef8354]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Faith-Centered</h3>
                <p className="text-[#bfc0c0]/80">
                  Events are held at mosques with a focus on Islamic values and principles.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
        <Card>
          <CardContent className="py-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Register now to reserve your spot at the next event.
              Space is limited and all participants undergo background checks.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg">Register Now</Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="secondary">
                  Already Registered? Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#4f5d75] py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center gap-4">
            <Logo size="sm" />
            <div className="text-center space-y-2">
              <p className="text-[#bfc0c0] text-sm">
                © 2025 Halal Match. All rights reserved.
              </p>
              <p className="text-[#bfc0c0]/70 text-sm">
                Built by{" "}
                <a
                  href="https://www.linkedin.com/in/imran-khan-728077130/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#ef8354] hover:text-[#f0925e] transition-colors font-medium"
                >
                  @Imran Khan
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
