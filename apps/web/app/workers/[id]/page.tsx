"use client";

import { use, useEffect, useState } from "react";

import AppNavbar from "@/app/components/AppNavbar";
import { apiFetch } from "@/lib/api";

type Review = {
  id: number;
  job_id: number;
  reviewer_user_id: number;
  target_user_id: number;
  rating: number;
  comment?: string | null;
  created_at: string;
};

type WorkerPublicProfile = {
  id: number;
  full_name: string;
  city?: string | null;
  region?: string | null;
  bio?: string | null;
  skills?: string | null;
  hourly_rate?: number | null;
  profile_picture_url?: string | null;
  average_rating?: number | null;
  reviews_count: number;
  completed_jobs_count: number;
  reviews: Review[];
};

export default function WorkerPublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);

  const [profile, setProfile] =
    useState<WorkerPublicProfile | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data: WorkerPublicProfile =
          await apiFetch(
            `/users/workers/${resolvedParams.id}`
          );

        setProfile(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <>
        <AppNavbar />
        <div className="p-10">Chargement...</div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <AppNavbar />
        <div className="p-10">
          Profil travailleur introuvable.
        </div>
      </>
    );
  }

  return (
    <>
      <AppNavbar />

      <main className="min-h-[calc(100vh-73px)] bg-gray-50 px-4 py-8 md:p-10">
        <div className="max-w-4xl mx-auto space-y-6">
          <section className="bg-white border rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold">
                {profile.profile_picture_url ? (
                  <img
                    src={profile.profile_picture_url}
                    alt={profile.full_name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  profile.full_name.charAt(0)
                )}
              </div>

              <div>
                <h1 className="text-3xl md:text-4xl font-bold">
                  {profile.full_name}
                </h1>

                <p className="text-gray-600 mt-1">
                  {profile.city || "Ville non précisée"}
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Région : {profile.region || "Témiscaming"}
                </p>

                <p className="mt-3 text-lg font-semibold">
                  ⭐{" "}
                  {profile.average_rating
                    ? profile.average_rating.toFixed(1)
                    : "Aucune note"}{" "}
                  · {profile.reviews_count} avis
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-8">
              <StatCard
                label="Missions complétées"
                value={profile.completed_jobs_count}
              />

              <StatCard
                label="Note moyenne"
                value={
                  profile.average_rating
                    ? profile.average_rating.toFixed(1)
                    : "-"
                }
              />

              <StatCard
                label="Tarif horaire"
                value={
                  profile.hourly_rate
                    ? `${profile.hourly_rate} $/h`
                    : "Non précisé"
                }
              />
            </div>
          </section>

          <section className="bg-white border rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-4">
              À propos
            </h2>

            <p className="text-gray-700">
              {profile.bio || "Aucune bio fournie."}
            </p>

            <div className="mt-6">
              <h3 className="font-semibold mb-2">
                Compétences
              </h3>

              <p className="text-gray-700">
                {profile.skills || "Compétences non précisées."}
              </p>
            </div>
          </section>

          <section className="bg-white border rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-4">
              Avis reçus
            </h2>

            {profile.reviews.length === 0 && (
              <p className="text-gray-500">
                Aucun avis pour le moment.
              </p>
            )}

            <div className="space-y-4">
              {profile.reviews.map((review) => (
                <div
                  key={review.id}
                  className="border rounded-lg p-4"
                >
                  <p className="font-semibold">
                    {"⭐".repeat(review.rating)}
                  </p>

                  <p className="text-gray-700 mt-2">
                    {review.comment || "Aucun commentaire."}
                  </p>

                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(review.created_at).toLocaleDateString(
                      "fr-CA"
                    )}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="border rounded-xl p-4 bg-gray-50">
      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="text-2xl font-bold mt-1">
        {value}
      </p>
    </div>
  );
}