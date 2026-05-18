"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import AppNavbar from "@/app/components/AppNavbar";
import { apiFetch } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [canWork, setCanWork] =
    useState(false);

  const [canHire, setCanHire] =
    useState(true);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!canWork && !canHire) {
      setError(
        "Sélectionnez au moins une option."
      );
      return;
    }

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
            can_work: canWork,
            can_hire: canHire,
          }),
        }
      );

      router.push("/login");
    } catch (error) {
      console.error(error);

      setError(
        "Impossible de créer le compte."
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
              Créer un compte
            </h1>

            <p className="text-gray-600 mt-2">
              Rejoignez MainForte dès aujourd’hui.
            </p>

            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 text-blue-800 px-4 py-3 text-sm">
              MainForte est actuellement disponible dans la région du Témiscaming.
            </div>
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block mb-2 font-medium">
              Nom complet
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
              Courriel
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
              Mot de passe
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
            <label className="block mb-3 font-medium">
              Je veux
            </label>

            <div className="space-y-3">
              <label className="flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={canWork}
                  onChange={(e) =>
                    setCanWork(
                      e.target.checked
                    )
                  }
                />

                <span>
                  Trouver du travail local
                </span>
              </label>

              <label className="flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={canHire}
                  onChange={(e) =>
                    setCanHire(
                      e.target.checked
                    )
                  }
                />

                <span>
                  Publier des besoins et engager
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
          >
            {loading
              ? "Création du compte..."
              : "Créer mon compte"}
          </button>

          <p className="text-center text-sm text-gray-600">
            Vous avez déjà un compte ?{" "}

            <Link
              href="/login"
              className="text-blue-600 hover:underline"
            >
              Connexion
            </Link>
          </p>
        </form>
      </div>
    </>
  );
}