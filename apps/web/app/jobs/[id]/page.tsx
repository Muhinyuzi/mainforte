"use client";

import {
  use,
  useCallback,
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import AppNavbar from "@/app/components/AppNavbar";
import { apiFetch } from "@/lib/api";

type User = {
  id: number;
  can_work: boolean;
  can_hire: boolean;
};

type Job = {
  id: number;
  client_id: number;
  title: string;
  description?: string;
  city: string;
  region?: string;
  address_optional?: string;
  budget_amount: number;
  duration_estimate_hours?: number;
  urgency?: string;
  status: string;
  needed_at?: string;
};

function getStatusLabel(status: string) {
  switch (status) {
    case "open":
      return "Ouvert";
    case "matched":
      return "Accepté";
    case "in_progress":
      return "En cours";
    case "completed":
      return "Terminé";
    default:
      return status;
  }
}

function getUrgencyLabel(urgency?: string) {
  switch (urgency) {
    case "today":
      return "Aujourd’hui";
    case "urgent":
      return "Urgent";
    case "this_week":
      return "Cette semaine";
    default:
      return urgency || "Non précisée";
  }
}

export default function JobDetailPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const resolvedParams = use(params);

  const [user, setUser] =
    useState<User | null>(null);

  const [job, setJob] =
    useState<Job | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [applied, setApplied] =
    useState(false);

  const [toast, setToast] =
    useState<string | null>(null);

  const showToast = useCallback(
    (message: string) => {
      setToast(message);

      setTimeout(() => {
        setToast(null);
      }, 3000);
    },
    []
  );

  async function markJobActivityAsRead(
    jobId: number
  ) {
    try {
      await apiFetch(
        `/jobs/${jobId}/mark-activity-read`,
        {
          method: "POST",
        }
      );
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    async function loadData() {
      try {
        const me: User =
          await apiFetch("/users/me");

        setUser(me);

        const data: Job =
          await apiFetch(
            `/jobs/${resolvedParams.id}`
          );

        setJob(data);

        if (me.id === data.client_id) {
          await markJobActivityAsRead(data.id);
        }
      } catch (error) {
        console.error(error);

        showToast(
          "Erreur lors du chargement du besoin."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [resolvedParams.id, showToast]);

  async function handleApply() {
    if (!job) {
      return;
    }

    if (!user?.can_work) {
      showToast(
        "Vous devez activer le mode travailleur pour postuler."
      );

      return;
    }

    try {
      await apiFetch(
        `/applications/jobs/${job.id}`,
        {
          method: "POST",
          body: JSON.stringify({
            message:
              "Disponible immédiatement.",
            proposed_rate:
              job.budget_amount,
          }),
        }
      );

      setApplied(true);

      showToast("Candidature envoyée !");
    } catch (error) {
      console.error(error);

      showToast(
        "Impossible d’envoyer la candidature."
      );
    }
  }

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

  if (!job) {
    return (
      <>
        <AppNavbar />

        <div className="p-10">
          Besoin introuvable.
        </div>
      </>
    );
  }

  const isOpen =
    job.status === "open";

  return (
    <>
      <AppNavbar />

      {toast && (
        <div className="fixed top-5 right-5 bg-black text-white px-4 py-3 rounded shadow-lg z-50">
          {toast}
        </div>
      )}

      <main className="min-h-[calc(100vh-73px)] bg-gray-50 px-4 py-8 md:p-10">
        <div className="max-w-3xl mx-auto border rounded-2xl p-6 md:p-8 bg-white shadow-sm">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {job.title}
            </h1>

            <p className="text-gray-600">
              {job.description ||
                "Aucune description fournie."}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <InfoCard
              label="Ville"
              value={job.city}
            />

            <InfoCard
              label="Région"
              value={job.region || "Témiscaming"}
            />

            <InfoCard
              label="Lieu approximatif"
              value={
                job.address_optional ||
                "Non précisé"
              }
            />

            <InfoCard
              label="Budget proposé"
              value={`${job.budget_amount} $/h`}
            />

            <InfoCard
              label="Durée estimée"
              value={
                job.duration_estimate_hours
                  ? `${job.duration_estimate_hours} h`
                  : "Non précisée"
              }
            />

            <InfoCard
              label="Urgence"
              value={getUrgencyLabel(job.urgency)}
            />

            <InfoCard
              label="Statut"
              value={getStatusLabel(job.status)}
            />

            <InfoCard
              label="Date souhaitée"
              value={
                job.needed_at
                  ? new Date(
                      job.needed_at
                    ).toLocaleString("fr-CA")
                  : "Non précisée"
              }
            />
          </div>

          <div className="mt-8">
            <div className="mb-5">
              <Link
                href={`/clients/${job.client_id}`}
                className="inline-flex items-center text-blue-600 hover:underline font-medium"
              >
                Voir le profil du client
              </Link>
            </div>

            {!applied && isOpen && (
              <button
                onClick={handleApply}
                className="bg-black text-white px-6 py-3 rounded-xl font-semibold"
              >
                Postuler à ce besoin
              </button>
            )}

            {applied && (
              <p className="text-green-600 font-bold">
                Candidature envoyée
              </p>
            )}

            {!isOpen && (
              <p className="text-gray-600 font-medium">
                Ce besoin n’est plus ouvert.
              </p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="border rounded-xl p-4">
      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="font-semibold">
        {value}
      </p>
    </div>
  );
}