"use client";

import {
  useState
} from "react";

import Link from "next/link";

import {
  useRouter
} from "next/navigation";

import AppNavbar from "@/app/components/AppNavbar";

import {
  saveToken
} from "@/lib/auth";

import {
  apiFetch
} from "@/lib/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL;

export default function LoginPage() {

  const router =
    useRouter();

  const [email,
    setEmail] =
    useState("");

  const [password,
    setPassword] =
    useState("");

  const [loading,
    setLoading] =
    useState(false);

  const [error,
    setError] =
    useState<string | null>(
      null
    );

  async function handleLogin(
    e: React.FormEvent
  ) {

    e.preventDefault();

    try {

      setLoading(true);

      setError(null);

      const formData =
        new URLSearchParams();

      formData.append(
        "username",
        email
      );

      formData.append(
        "password",
        password
      );

      const response =
        await fetch(
          `${API_BASE_URL}/auth/login`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded",
            },

            body: formData,
          }
        );

      if (!response.ok) {

        setError(
          "Courriel ou mot de passe invalide."
        );

        return;
      }

      const data =
        await response.json();

      saveToken(
        data.access_token
      );

      const me =
        await apiFetch(
          "/users/me"
        );

      if (me.can_work) {

        router.push(
          "/worker/dashboard"
        );

      } else if (
        me.can_hire
      ) {

        router.push(
          "/client/dashboard"
        );

      } else {

        router.push("/");
      }

    } catch (error) {

      console.error(error);

      setError(
        "Impossible de se connecter."
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
          onSubmit={handleLogin}
          className="bg-white border rounded-2xl p-8 w-full max-w-md shadow-sm space-y-5"
        >

          <div>

            <h1 className="text-3xl font-bold">
              Connexion
            </h1>

            <p className="text-gray-600 mt-2">
              Connectez-vous à votre compte MainForte.
            </p>

          </div>

          {error && (

            <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>

          )}

          <div>

            <label className="block mb-2 font-medium">
              Courriel
            </label>

            <input
              type="email"

              placeholder="exemple@email.com"

              className="w-full border rounded-xl px-4 py-3"

              value={email}

              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }

              required
            />

          </div>

          <div>

            <label className="block mb-2 font-medium">
              Mot de passe
            </label>

            <input
              type="password"

              placeholder="Votre mot de passe"

              className="w-full border rounded-xl px-4 py-3"

              value={password}

              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }

              required
            />

          </div>

          <button
            type="submit"

            disabled={loading}

            className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
          >

            {loading
              ? "Connexion..."
              : "Se connecter"}

          </button>

          <p className="text-center text-sm text-gray-600">

            Vous n’avez pas encore de compte ?{" "}

            <Link
              href="/register"
              className="text-blue-600 hover:underline"
            >
              Inscription
            </Link>

          </p>

        </form>

      </div>
    </>
  );
}