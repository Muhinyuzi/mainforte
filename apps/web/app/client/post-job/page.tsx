"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import AppNavbar from "@/app/components/AppNavbar";

import { apiFetch } from "@/lib/api";

import { TEMISCAMING_CITIES } from "@/lib/constants/regions";

type User = {
  id: number;
  can_work: boolean;
  can_hire: boolean;
};

const categories = [
  { id: 1, label: "Déménagement" },
  { id: 2, label: "Ménage" },
  { id: 3, label: "Jardinage" },
  { id: 4, label: "Transport" },
  { id: 5, label: "Gardiennage" },
  { id: 6, label: "Aide ponctuelle" },
];

export default function PostJobPage() {
  const router = useRouter();

  const [categoryId, setCategoryId] =
    useState(1);

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [city, setCity] =
    useState("Ville-Marie");

  const [address, setAddress] =
    useState("");

  const [urgency, setUrgency] =
    useState("today");

  const [durationHours, setDurationHours] =
    useState(2);

  const [budget, setBudget] =
    useState(30);

  const [neededDate, setNeededDate] =
    useState("");

  const [neededTime, setNeededTime] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    async function checkAccess() {
      try {
        const me: User =
          await apiFetch("/users/me");

        if (!me.can_hire) {
          router.push(
            "/worker/dashboard"
          );
        }
      } catch (error) {
        console.error(error);

        router.push("/login");
      }
    }

    checkAccess();
  }, [router]);

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    try {
      setLoading(true);

      await apiFetch("/jobs", {
        method: "POST",

        body: JSON.stringify({
          category_id: categoryId,

          title,

          description,

          city,

          address_optional: address,

          needed_at: new Date(
            `${neededDate}T${neededTime}`
          ).toISOString(),

          duration_estimate_hours:
            durationHours,

          urgency,

          budget_type: "hourly",

          budget_amount: budget,
        }),
      });

      router.push(
        "/client/dashboard"
      );

    } catch (error) {

      console.error(error);

      alert(
        "Impossible de publier le besoin."
      );

    } finally {

      setLoading(false);
    }
  }

  return (
    <>
      <AppNavbar />

      <main className="min-h-[calc(100vh-73px)] bg-gray-50 px-4 py-8 md:p-10">

        <div className="max-w-2xl mx-auto">

          <div className="mb-8">

            <h1 className="text-3xl md:text-4xl font-bold">
              Publier un besoin
            </h1>

            <p className="mt-3 text-gray-600">
              Décrivez rapidement l’aide dont vous avez besoin.
              Les personnes disponibles dans le Témiscaming pourront vous répondre.
            </p>

          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5 bg-white border rounded-2xl p-6 md:p-8 shadow-sm"
          >

            <div className="rounded-xl border border-blue-200 bg-blue-50 text-blue-800 px-4 py-3 text-sm">
              MainForte est actuellement disponible dans la région du Témiscaming.
            </div>

            <div>

              <label className="block mb-2 font-medium">
                Catégorie
              </label>

              <select
                value={categoryId}

                onChange={(e) =>
                  setCategoryId(
                    Number(
                      e.target.value
                    )
                  )
                }

                className="w-full border rounded-xl px-4 py-3"
              >

                {categories.map(
                  (category) => (

                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.label}
                    </option>

                  )
                )}

              </select>

            </div>

            <div>

              <label className="block mb-2 font-medium">
                Titre du besoin
              </label>

              <input
                type="text"

                value={title}

                onChange={(e) =>
                  setTitle(
                    e.target.value
                  )
                }

                className="w-full border rounded-xl px-4 py-3"

                placeholder="Ex : Besoin d’aide pour déménagement"

                required
              />

            </div>

            <div>

              <label className="block mb-2 font-medium">
                Description
              </label>

              <textarea
                value={description}

                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }

                className="w-full border rounded-xl px-4 py-3"

                rows={4}

                placeholder="Expliquez ce qu’il faut faire, l’heure souhaitée, les détails importants..."
              />

            </div>

            <div>

              <label className="block mb-2 font-medium">
                Ville
              </label>

              <select
                value={city}

                onChange={(e) =>
                  setCity(
                    e.target.value
                  )
                }

                className="w-full border rounded-xl px-4 py-3"

                required
              >

                {TEMISCAMING_CITIES.map(
                  (cityName) => (

                    <option
                      key={cityName}
                      value={cityName}
                    >
                      {cityName}
                    </option>

                  )
                )}

              </select>

            </div>

            <div>

              <label className="block mb-2 font-medium">
                Adresse ou lieu approximatif
              </label>

              <input
                type="text"

                value={address}

                onChange={(e) =>
                  setAddress(
                    e.target.value
                  )
                }

                className="w-full border rounded-xl px-4 py-3"

                placeholder="Ex : près du centre-ville, quartier, rue..."
              />

            </div>

            <div>

              <label className="block mb-2 font-medium">
                Date
              </label>

              <input
                type="date"

                value={neededDate}

                onChange={(e) =>
                  setNeededDate(
                    e.target.value
                  )
                }

                className="w-full border rounded-xl px-4 py-3"

                required
              />

            </div>

            <div>

              <label className="block mb-2 font-medium">
                Heure
              </label>

              <input
                type="time"

                value={neededTime}

                onChange={(e) =>
                  setNeededTime(
                    e.target.value
                  )
                }

                className="w-full border rounded-xl px-4 py-3"

                required
              />

            </div>

            <div>

              <label className="block mb-2 font-medium">
                Urgence
              </label>

              <select
                value={urgency}

                onChange={(e) =>
                  setUrgency(
                    e.target.value
                  )
                }

                className="w-full border rounded-xl px-4 py-3"
              >

                <option value="now">
                  Maintenant
                </option>

                <option value="today">
                  Aujourd’hui
                </option>

                <option value="tonight">
                  Ce soir
                </option>

                <option value="this_week">
                  Cette semaine
                </option>

              </select>

            </div>

            <div>

              <label className="block mb-2 font-medium">
                Durée estimée
              </label>

              <input
                type="number"

                min={1}

                value={durationHours}

                onChange={(e) =>
                  setDurationHours(
                    Number(
                      e.target.value
                    )
                  )
                }

                className="w-full border rounded-xl px-4 py-3"
              />

            </div>

            <div>

              <label className="block mb-2 font-medium">
                Budget proposé ($/h)
              </label>

              <input
                type="number"

                min={1}

                value={budget}

                onChange={(e) =>
                  setBudget(
                    Number(
                      e.target.value
                    )
                  )
                }

                className="w-full border rounded-xl px-4 py-3"
              />

            </div>

            <button
              type="submit"

              disabled={loading}

              className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
            >

              {loading
                ? "Publication..."
                : "Publier le besoin"}

            </button>

          </form>

        </div>

      </main>
    </>
  );
}