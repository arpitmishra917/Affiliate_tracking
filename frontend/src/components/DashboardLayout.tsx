"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    if (typeof window !== "undefined") window.location.href = "/login";
    return null;
  }

  const navLinks = () => {
    switch (user.role) {
      case "ADMIN":
        return [
          { name: "Dashboard", href: "/dashboard" },
          { name: "Managers", href: "/users" }, 
          { name: "Affiliates", href: "/affiliates" },
          { name: "Offers", href: "/offers" },
          { name: "Tracking Links", href: "/tracking-links" },
          { name: "Clicks", href: "/clicks" },
          { name: "Profile", href: "/profile" },
        ];
      case "MANAGER":
        return [
          { name: "Dashboard", href: "/dashboard" },
          { name: "My Affiliates", href: "/affiliates" },
          { name: "Offers", href: "/offers" },
          { name: "Tracking Links", href: "/tracking-links" },
          { name: "Clicks", href: "/clicks" },
          { name: "Profile", href: "/profile" },
        ];
      case "AFFILIATE":
        return [
          { name: "Dashboard", href: "/dashboard" },
          { name: "My Offers", href: "/offers" },
          { name: "My Tracking Links", href: "/tracking-links" },
          { name: "My Clicks", href: "/clicks" },
          { name: "Profile", href: "/profile" },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-blue-600">Trackify</span>
              </div>
              <nav className="hidden md:flex space-x-4">
                {navLinks().map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      pathname === link.href
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user.name} ({user.role})</span>
              <button
                onClick={logout}
                className="text-sm px-3 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
