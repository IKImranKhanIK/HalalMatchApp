"use client";

import { useSession, signOut, SessionProvider } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import Logo from "@/components/shared/Logo";

function AdminLayoutInner({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/admin/login");
  };

  // Don't show layout on login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Show loading while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Redirect if not authenticated
  if (status === "unauthenticated") {
    router.push("/admin/login");
    return null;
  }

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/participants", label: "Participants" },
    { href: "/admin/selections", label: "Selections" },
    { href: "/admin/history", label: "History" },
    { href: "/admin/registration-qr", label: "QR Code" },
  ];

  return (
    <div className="min-h-screen bg-[#2d3142] text-white">
      {/* Navigation Bar */}
      <nav className="bg-[#3d4457] border-b border-[#4f5d75]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Nav Links */}
            <div className="flex items-center gap-8">
              <Link href="/admin/dashboard">
                <Logo size="sm" showTagline={false} />
              </Link>
              <div className="hidden md:flex items-center space-x-6">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 rounded-2xl transition-colors ${
                      pathname === item.href
                        ? "bg-[#ef8354] text-white font-semibold"
                        : "text-[#bfc0c0] hover:bg-[#4f5d75]"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* User Info and Logout */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#bfc0c0]">
                {session?.user?.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>

          {/* Mobile Nav */}
          <div className="md:hidden flex space-x-3 pb-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-2xl text-sm transition-colors ${
                  pathname === item.href
                    ? "bg-[#ef8354] text-white font-semibold"
                    : "text-[#bfc0c0] hover:bg-[#4f5d75]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider
      basePath="/api/auth"
      refetchInterval={5 * 60}
      refetchOnWindowFocus={true}
    >
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </SessionProvider>
  );
}
