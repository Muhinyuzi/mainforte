"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import AppNavbar from "@/app/components/AppNavbar";
import { apiFetch } from "@/lib/api";

type User = {
  id: number;
  role: string;
};

export default function HomePage() {
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

  const dashboardHref =
    user?.role === "worker"
      ? "/worker/dashboard"
      : "/client/dashboard";

  return (
    <>
      <AppNavbar />

      <main className="min-h-[calc(100vh-73px)] bg-gradient-to-b from-white to-blue-50">
        <section className="px-6 py-24 text-center max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            Find Local Help.
            <br />

            <span className="text-blue-600">
              Find Local Work.
            </span>
          </h1>

          <p className="mt-8 text-xl text-gray-600 max-w-2xl mx-auto">
            MainForte connects people who need help
            with workers available nearby in real time.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {!user && (
              <>
                <Link
                  href="/register"
                  className="bg-black text-white px-8 py-4 rounded-xl text-lg font-semibold hover:opacity-90 transition"
                >
                  Get Started
                </Link>

                <Link
                  href="/login"
                  className="border px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition"
                >
                  Login
                </Link>
              </>
            )}

            {user && (
              <Link
                href={dashboardHref}
                className="bg-black text-white px-8 py-4 rounded-xl text-lg font-semibold hover:opacity-90 transition"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </section>

        <section className="px-6 pb-24">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
            <div className="bg-white border rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold mb-4">
                Post Jobs
              </h2>

              <p className="text-gray-600">
                Need help with moving, cleaning,
                gardening or quick local work?
                Post a job in minutes.
              </p>
            </div>

            <div className="bg-white border rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold mb-4">
                Find Workers
              </h2>

              <p className="text-gray-600">
                Discover available workers nearby
                ready to help immediately.
              </p>
            </div>

            <div className="bg-white border rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold mb-4">
                Real-Time Chat
              </h2>

              <p className="text-gray-600">
                Communicate instantly through
                integrated messaging.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}