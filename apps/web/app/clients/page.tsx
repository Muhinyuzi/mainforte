"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import AppNavbar from "@/app/components/AppNavbar";

import { apiFetch } from "@/lib/api";

type Client = {
  id: number;

  full_name: string;

  city?: string;

  region?: string;  

  bio?: string;

  profile_picture_url?: string;

  average_rating?: number;

  reviews_count: number;

  posted_jobs_count: number;

  completed_jobs_count: number;
};

export default function ClientsPage() {

  const [clients, setClients] =
    useState<Client[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    async function loadClients() {

      try {

        const data =
          await apiFetch("/users/clients");

        setClients(data);

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);
      }
    }

    loadClients();

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
              Clients
            </h1>

            <p className="mt-3 text-gray-600 text-lg">
              Découvrez les personnes qui publient des besoins dans votre région.
            </p>

          </div>

          {clients.length === 0 && (

            <div className="bg-white border rounded-2xl p-10 text-center">

              <p className="text-gray-500">
                Aucun client pour le moment.
              </p>

            </div>

          )}

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

            {clients.map((client) => (

              <div
                key={client.id}
                className="bg-white border rounded-3xl p-6 shadow-sm flex flex-col"
              >

                <div className="flex items-center gap-4">

                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold overflow-hidden">

                    {client.profile_picture_url ? (

                      <img
                        src={client.profile_picture_url}
                        alt={client.full_name}
                        className="w-full h-full object-cover"
                      />

                    ) : (

                      client.full_name.charAt(0)

                    )}

                  </div>

                  <div>

                    <h2 className="text-2xl font-bold">
                      {client.full_name}
                    </h2>

                    <p className="text-gray-600">
                      {client.city || "Ville non précisée"}
                    </p>

                    <p className="text-sm text-gray-500">
                      Région : Témiscaming
                    </p>

                  </div>

                </div>

                <div className="mt-6 space-y-3">

                  <div className="flex items-center justify-between">

                    <span className="text-gray-500">
                      Note
                    </span>

                    <span className="font-semibold">

                      {client.average_rating
                        ? `⭐ ${client.average_rating.toFixed(1)}`
                        : "Aucune note"}

                    </span>

                  </div>

                  <div className="flex items-center justify-between">

                    <span className="text-gray-500">
                      Avis
                    </span>

                    <span className="font-semibold">
                      {client.reviews_count}
                    </span>

                  </div>

                  <div className="flex items-center justify-between">

                    <span className="text-gray-500">
                      Besoins publiés
                    </span>

                    <span className="font-semibold">
                      {client.posted_jobs_count}
                    </span>

                  </div>

                  <div className="flex items-center justify-between">

                    <span className="text-gray-500">
                      Travaux terminés
                    </span>

                    <span className="font-semibold">
                      {client.completed_jobs_count}
                    </span>

                  </div>

                </div>

                <div className="mt-6">

                  <p className="text-gray-700 line-clamp-4">

                    {client.bio ||
                      "Aucune description."}

                  </p>

                </div>

                <div className="mt-8">

                  <Link
                    href={`/clients/${client.id}`}
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