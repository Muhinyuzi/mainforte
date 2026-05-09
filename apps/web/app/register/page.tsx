"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import Link from "next/link";

import AppNavbar from "@/app/components/AppNavbar";

import { apiFetch } from "@/lib/api";

export default function RegisterPage() {

  const router = useRouter();

  const [fullName,
    setFullName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password,
    setPassword] =
    useState("");

  const [role, setRole] =
    useState("worker");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(
      null
    );

  async function handleSubmit(
    e: React.FormEvent
  ) {

    e.preventDefault();

    setLoading(true);

    setError(null);

    try {

      await apiFetch(
        "/auth/register",
        {
          method: "POST",

          body: JSON.stringify({
            full_name: fullName,
            email,
            password,
            role,
          }),
        }
      );

      router.push("/login");

    } catch (error) {

      console.error(error);

      setError(
        "Failed to register"
      );

    } finally {

      setLoading(false);
    }
  }

  return (
    <>
      <AppNavbar />

      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center bg-gray-50 px-4">

        <form
          onSubmit={handleSubmit}
          className="bg-white border rounded-2xl p-8 w-full max-w-md shadow-sm space-y-5"
        >

          <div>
            <h1 className="text-3xl font-bold">
              Create Account
            </h1>

            <p className="text-gray-600 mt-2">
              Join MainForte today
            </p>
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block mb-2 font-medium">
              Full Name
            </label>

            <input
              type="text"

              value={fullName}

              onChange={(e) =>
                setFullName(
                  e.target.value
                )
              }

              className="w-full border rounded-xl px-4 py-3"

              required
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Email
            </label>

            <input
              type="email"

              value={email}

              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }

              className="w-full border rounded-xl px-4 py-3"

              required
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Password
            </label>

            <input
              type="password"

              value={password}

              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }

              className="w-full border rounded-xl px-4 py-3"

              required
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              I want to
            </label>

            <select
              value={role}

              onChange={(e) =>
                setRole(
                  e.target.value
                )
              }

              className="w-full border rounded-xl px-4 py-3"
            >

              <option value="worker">
                Find Work
              </option>

              <option value="client">
                Hire Workers
              </option>

            </select>
          </div>

          <button
            type="submit"

            disabled={loading}

            className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
          >

            {loading
              ? "Creating account..."
              : "Create Account"}

          </button>

          <p className="text-center text-sm text-gray-600">

            Already have an account?{" "}

            <Link
              href="/login"
              className="text-blue-600 hover:underline"
            >
              Login
            </Link>

          </p>

        </form>

      </div>
    </>
  );
}