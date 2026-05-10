"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { apiFetch } from "@/lib/api";
import { logout } from "@/lib/auth";

type User = {
  id: number;
  full_name: string;
  role: string;
  can_work: boolean;
  can_hire: boolean;
};

export default function AppNavbar() {
  const router = useRouter();

  const [user, setUser] =
    useState<User | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const data =
          await apiFetch("/users/me");

        setUser(data);
      } catch {
        setUser(null);
      }
    }

    loadUser();
  }, []);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <nav className="border-b bg-white px-4 md:px-6 py-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 md:gap-6">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight hover:opacity-80 transition"
          >
            Main<span className="text-blue-600">Forte</span>
          </Link>

          {user?.can_work && (
            <>
              <Link
                href="/worker/dashboard"
                className="hover:text-blue-600"
              >
                Worker Dashboard
              </Link>

              <Link
                href="/worker/applications"
                className="hover:text-blue-600"
              >
                Applications
              </Link>
            </>
          )}

          {user?.can_hire && (
            <>
              <Link
                href="/client/dashboard"
                className="hover:text-blue-600"
              >
                Client Dashboard
              </Link>

              <Link
                href="/client/post-job"
                className="hover:text-blue-600"
              >
                Post Job
              </Link>
            </>
          )}

          {user && (
            <Link
              href="/messages"
              className="hover:text-blue-600"
            >
              Messages
            </Link>
          )}
        </div>

        {!user && (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hover:text-blue-600"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="bg-black text-white px-4 py-2 rounded"
            >
              Register
            </Link>
          </div>
        )}

        {user && (
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600">
              {user.full_name}
            </p>

            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}