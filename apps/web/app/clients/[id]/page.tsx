"use client";

import { use, useEffect, useState } from "react";

import AppNavbar from "@/app/components/AppNavbar";
import { apiFetch } from "@/lib/api";

type Review = {
  id: number;
  rating: number;
  comment?: string | null;
  reviewer?: {
    id: number;
    full_name: string;
  };
};

type ClientProfile = {
  id: number;
  full_name: string;
  city?: string | null;
  region?: string | null;
  bio?: string | null;
  profile_picture_url?: string | null;
  posted_jobs_count: number;
  completed_jobs_count: number;
  average_rating?: number | null;
  reviews_count: number;
  reviews: Review[];
};

export default function ClientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);

  const [client, setClient] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadClient() {
      try {
        const data: ClientProfile = await apiFetch(
          `/users/clients/${resolvedParams.id}`
        );

        setClient(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadClient();
  }, [resolvedParams.id]);

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

  if (!client) {
    return (
      <>
        <AppNavbar />

        <div className="p-10">
          Client introuvable.
        </div>
      </>
    );
  }

  return (
    <>
      <AppNavbar />

      <div className="max-w-5xl mx-auto p-6 space-y-8">
        <div className="border rounded-3xl p-8 bg-white">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-4xl font-bold">
              {client.profile_picture_url ? (
                <img
                  src={client.profile_picture_url}
                  alt={client.full_name}
                  className="w-32 h-32 rounded-full object-cover"
                />
              ) : (
                client.full_name.charAt(0)
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-5xl font-bold">
                {client.full_name}
              </h1>

              <p className="text-gray-600 mt-2 text-lg">
                {client.city || "Ville non précisée"}
              </p>

              <p className="text-sm text-gray-500 mt-1">
                Région : Témiscaming
              </p>

              <div className="mt-4 flex items-center gap-2 text-lg font-semibold">
                <span>⭐</span>

                {client.average_rating ? (
                  <span>
                    {client.average_rating.toFixed(1)} ·{" "}
                    {client.reviews_count} avis
                  </span>
                ) : (
                  <span>
                    Aucune note · {client.reviews_count} avis
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="border rounded-2xl p-5">
                  <p className="text-gray-500">
                    Besoins publiés
                  </p>

                  <p className="text-4xl font-bold mt-2">
                    {client.posted_jobs_count}
                  </p>
                </div>

                <div className="border rounded-2xl p-5">
                  <p className="text-gray-500">
                    Travaux terminés
                  </p>

                  <p className="text-4xl font-bold mt-2">
                    {client.completed_jobs_count}
                  </p>
                </div>

                <div className="border rounded-2xl p-5">
                  <p className="text-gray-500">
                    Note moyenne
                  </p>

                  <p className="text-4xl font-bold mt-2">
                    {client.average_rating
                      ? client.average_rating.toFixed(1)
                      : "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border rounded-3xl p-8 bg-white">
          <h2 className="text-3xl font-bold mb-6">
            À propos
          </h2>

          <p className="text-lg text-gray-700 whitespace-pre-line">
            {client.bio || "Aucune description."}
          </p>
        </div>

        <div className="border rounded-3xl p-8 bg-white">
          <h2 className="text-3xl font-bold mb-6">
            Avis reçus
          </h2>

          <div className="space-y-4">
            {client.reviews.length === 0 && (
              <p className="text-gray-500">
                Aucun avis pour le moment.
              </p>
            )}

            {client.reviews.map((review) => (
              <div
                key={review.id}
                className="border rounded-2xl p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold">
                    {review.reviewer?.full_name || "Utilisateur"}
                  </p>

                  <p className="font-bold">
                    ⭐ {review.rating}/5
                  </p>
                </div>

                <p className="text-gray-700">
                  {review.comment || "Aucun commentaire."}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}