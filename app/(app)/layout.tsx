"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Video, Image, Home } from "lucide-react";
import React, { useEffect } from "react";
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isSignedIn, user } = useUser();

  // 🔹 Redirect root `/` to `/home` initially
  useEffect(() => {
    if (pathname === "/" || pathname === "/app") {
      router.replace("/home");
    }
  }, [pathname, router]);

  const navItems = [
    { name: "Home", href: "/home", icon: Home },
    { name: "Social Share", href: "/social-share", icon: Image },
    { name: "Videos Upload", href: "/video-upload", icon: Video },
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      {/* ===== Sidebar ===== */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-md flex flex-col p-5">
        <h1 className="text-2xl font-bold mb-8 text-center text-blue-600">
          Dashboard
        </h1>

        <nav className="flex flex-col gap-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                  active
                    ? "bg-blue-600 text-white shadow-md"
                    : "hover:bg-blue-50 dark:hover:bg-gray-700"
                }`}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ===== Main Section ===== */}
      <div className="flex-1 flex flex-col">
        {/* ===== Header ===== */}
        <header className="h-[10%] flex justify-between items-center px-6 bg-white dark:bg-gray-800 border-b shadow-sm">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-100">
            {pathname === "/home"
              ? "Home"
              : pathname === "/video-upload"
              ? "Video Upload"
              : pathname === "/social-share"
              ? "Social Share"
              : "Dashboard"}
          </h2>

          {/* ===== Auth Section ===== */}
          <div className="flex items-center gap-4">
            {isSignedIn ? (
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-700 dark:text-gray-200 text-right">
                  <div className="font-semibold">{user?.fullName}</div>
                  <div className="text-gray-500 text-xs">
                    {user?.primaryEmailAddress?.emailAddress}
                  </div>
                </div>
                <UserButton afterSignOutUrl="/home" />
              </div>
            ) : (
              <SignInButton mode="modal">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm">
                  Sign In
                </button>
              </SignInButton>
            )}
          </div>
        </header>

        {/* ===== Main Content ===== */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
}
