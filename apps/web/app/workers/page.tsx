"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import AppNavbar from "@/app/components/AppNavbar";

import { apiFetch } from "@/lib/api";

type Worker = {
  id: number;

  full_name: string;

  city?: string;

  region?: string;

  bio?: string;

  skills?: string;

  hourly_rate?: number;

  profile_picture_url?: string;

  average_rating?: number;

  reviews_count: number;

  completed_jobs_count: number;
};

export default function WorkersPage() {

  const [workers, setWorkers] =
    useState<Worker[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    async function loadWorkers() {

      try {

        const data =
          await apiFetch("/users/workers");

        setWorkers(data);

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);
      }
    }

    loadWorkers();

  }, []);

  if (loading) {

    return (
      <>
        <AppNavbar />

        <div className="p-10">
          Chargement...
        </div>
      </>
    );
  }

  return (
    <>
      <AppNavbar />

      <main className="min-h-[calc(100vh-73px)] bg-gray-50 px-4 py-8 md:p-10">

        <div className="max-w-6xl mx-auto">

          <div className="mb-10">

            <h1 className="text-4xl md:text-5xl font-bold">
              Travailleurs disponibles
            </h1>

            <p className="mt-3 text-gray-600 text-lg">
              Découvrez les personnes disponibles dans votre région.
            </p>

          </div>

          {workers.length === 0 && (

            <div className="bg-white border rounded-2xl p-10 text-center">

              <p className="text-gray-500">
                Aucun travailleur disponible pour le moment.
              </p>

            </div>

          )}

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

            {workers.map((worker) => (

              <div
                key={worker.id}
                className="bg-white border rounded-3xl p-6 shadow-sm flex flex-col"
              >

                <div className="flex items-center gap-4">

                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold overflow-hidden">

                    {worker.profile_picture_url ? (

                      <img
                        src={worker.profile_picture_url}
                        alt={worker.full_name}
                        className="w-full h-full object-cover"
                      />

                    ) : (

                      worker.full_name.charAt(0)

                    )}

                  </div>

                  <div>

                    <h2 className="text-2xl font-bold">
                      {worker.full_name}
                    </h2>

                    <p className="text-gray-600">
                      {worker.city || "Ville non précisée"}
                    </p>

                    <p className="text-sm text-gray-500">
                      Région : {worker.region || "Témiscaming"}
                    </p>

                  </div>

                </div>

                <div className="mt-6 space-y-3">

                  <div className="flex items-center justify-between">

                    <span className="text-gray-500">
                      Note
                    </span>

                    <span className="font-semibold">

                      {worker.average_rating
                        ? `⭐ ${worker.average_rating.toFixed(1)}`
                        : "Aucune note"}

                    </span>

                  </div>

                  <div className="flex items-center justify-between">

                    <span className="text-gray-500">
                      Avis
                    </span>

                    <span className="font-semibold">
                      {worker.reviews_count}
                    </span>

                  </div>

                  <div className="flex items-center justify-between">

                    <span className="text-gray-500">
                      Missions complétées
                    </span>

                    <span className="font-semibold">
                      {worker.completed_jobs_count}
                    </span>

                  </div>

                  <div className="flex items-center justify-between">

                    <span className="text-gray-500">
                      Tarif
                    </span>

                    <span className="font-semibold">

                      {worker.hourly_rate
                        ? `${worker.hourly_rate} $/h`
                        : "Non précisé"}

                    </span>

                  </div>

                </div>

                <div className="mt-6">

                  <p className="text-gray-700 line-clamp-4">

                    {worker.bio ||
                      "Aucune description."}

                  </p>

                </div>

                <div className="mt-5">

                  <p className="text-sm font-medium text-gray-500 mb-2">
                    Compétences
                  </p>

                  <p className="text-gray-700 line-clamp-3">

                    {worker.skills ||
                      "Compétences non précisées."}

                  </p>

                </div>

                <div className="mt-8">

                  <Link
                    href={`/workers/${worker.id}`}
                    className="block w-full text-center bg-black text-white py-3 rounded-2xl font-semibold hover:opacity-90 transition"
                  >
                    Voir le profil
                  </Link>

                </div>

              </div>

            ))}

          </div>

        </div>

      </main>
    </>
  );
}