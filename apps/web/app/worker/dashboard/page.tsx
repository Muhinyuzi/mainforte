"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { apiFetch } from "@/lib/api";
import AppNavbar from "@/app/components/AppNavbar";
import ReviewForm from "@/app/components/ReviewForm";

type User = {
  id: number;
  email: string;
  full_name: string;
  role: string;
  can_work: boolean;
  can_hire: boolean;
};

type Availability = {
  id: number;
  city: string;
  region?: string;
  availability_type: string;
  status: string;
};

type MatchJob = {
  job: {
    id: number;
    client_id: number;
    title: string;
    description?: string;
    city: string;
    region?: string;
    budget_amount: number;
    status: string;
  };
  match_score: number;
  distance_km?: number;
};

type Application = {
  id: number;
  job_id: number;
  worker_profile_id: number;
  status: string;
};

function getJobStatusLabel(status: string) {
  switch (status) {
    case "open":
      return "Ouvert";
    case "matched":
      return "Travailleur accepté";
    case "in_progress":
      return "En cours";
    case "completed":
      return "Terminé";
    case "cancelled":
      return "Annulé";
    default:
      return status;
  }
}

export default function WorkerDashboard() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [jobs, setJobs] = useState<MatchJob[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<number[]>([]);
  const [acceptedJobIds, setAcceptedJobIds] = useState<number[]>([]);
  const [newJobIds, setNewJobIds] = useState<number[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const knownJobIdsRef = useRef<number[]>([]);
  const notifiedAcceptedIdsRef = useRef<number[]>([]);

  const showToast = useCallback((message: string) => {
    setToast(message);

    setTimeout(() => {
      setToast(null);
    }, 3000);
  }, []);

  const loadData = useCallback(async () => {
    try {
      const me: User = await apiFetch("/users/me");

      if (!me.can_work) {
        router.push("/client/dashboard");
        return;
      }

      const myAvailabilities: Availability[] =
        await apiFetch("/availabilities/me");

      const jobsData: MatchJob[] =
        await apiFetch("/workers/jobs/matches");

      const myApplications: Application[] =
        await apiFetch("/applications/me");

      const incomingJobIds = jobsData.map((item) => item.job.id);

      if (knownJobIdsRef.current.length > 0) {
        const newIds = incomingJobIds.filter(
          (id) => !knownJobIdsRef.current.includes(id)
        );

        setNewJobIds(newIds);

        if (newIds.length > 0) {
          showToast("Nouveau travail compatible disponible !");
        }
      }

      knownJobIdsRef.current = incomingJobIds;

      const appliedIds = myApplications.map(
        (application) => application.job_id
      );

      const acceptedIds = myApplications
        .filter((application) => application.status === "accepted")
        .map((application) => application.job_id);

      const newlyAcceptedIds = acceptedIds.filter(
        (id) => !notifiedAcceptedIdsRef.current.includes(id)
      );

      if (newlyAcceptedIds.length > 0) {
        showToast("🎉 Tu as obtenu le travail !");
      }

      notifiedAcceptedIdsRef.current = acceptedIds;

      setUser(me);
      setAvailabilities(myAvailabilities);
      setJobs(jobsData);
      setAppliedJobs(appliedIds);
      setAcceptedJobIds(acceptedIds);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [router, showToast]);

  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      loadData();
    }, 10000);

    return () => clearInterval(interval);
  }, [loadData]);

  async function handleApply(jobId: number) {
    try {
      await apiFetch(`/applications/jobs/${jobId}`, {
        method: "POST",
        body: JSON.stringify({
          message: "Disponible immédiatement.",
          proposed_rate: 28,
        }),
      });

      showToast("Candidature envoyée !");

      setAppliedJobs((prev) =>
        prev.includes(jobId) ? prev : [...prev, jobId]
      );

      loadData();
    } catch (error) {
      console.error(error);
      showToast("Échec de la candidature");
    }
  }

  async function handleStartJob(jobId: number) {
    try {
      await apiFetch(`/jobs/${jobId}/start`, {
        method: "PATCH",
      });

      showToast("Travail commencé !");
      loadData();
    } catch (error) {
      console.error(error);
      showToast("Impossible de commencer le travail");
    }
  }

  async function handleCompleteJob(jobId: number) {
    try {
      await apiFetch(`/jobs/${jobId}/complete`, {
        method: "PATCH",
      });

      showToast("Travail terminé !");
      loadData();
    } catch (error) {
      console.error(error);
      showToast("Impossible de terminer le travail");
    }
  }

  if (loading) {
    return (
      <>
        <AppNavbar />
        <div className="p-10">Chargement...</div>
      </>
    );
  }

  return (
    <>
      <AppNavbar />

      {toast && (
        <div className="fixed top-5 right-5 bg-black text-white px-4 py-3 rounded shadow-lg z-50">
          {toast}
        </div>
      )}

      <div className="p-10 space-y-10">
        <div>
          <h1 className="text-4xl font-bold">
            Tableau de bord travailleur
          </h1>

          <p className="mt-2 text-gray-600">
            Bienvenue {user?.full_name}
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">
            Mes disponibilités
          </h2>

          <div className="space-y-3">
            {availabilities.length === 0 && (
              <p className="text-gray-500">
                Aucune disponibilité créée pour le moment.
              </p>
            )}

            {availabilities.map((availability) => (
              <div
                key={availability.id}
                className="border rounded-lg p-4"
              >
                <p>Ville : {availability.city}</p>
                <p>Région : {availability.region || "Témiscaming"}</p>
                <p>Type : {availability.availability_type}</p>
                <p>Statut : {availability.status}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">
            Emplois compatibles
          </h2>

          <div className="space-y-3">
            {jobs.length === 0 && (
              <p className="text-gray-500">
                Aucun emploi compatible trouvé pour le moment.
              </p>
            )}

            {jobs.map((item) => {
              const job = item.job;
              const hasApplied = appliedJobs.includes(job.id);
              const isAccepted = acceptedJobIds.includes(job.id);

              return (
                <div
                  key={job.id}
                  className="border rounded-lg p-4"
                >
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="font-bold text-lg text-blue-600 hover:underline"
                    >
                      {job.title}
                    </Link>

                    {newJobIds.includes(job.id) && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                        NOUVEAU
                      </span>
                    )}
                  </div>

                  <p>Ville : {job.city}</p>
                  <p>Région : {job.region || "Témiscaming"}</p>

                  {item.distance_km !== undefined &&
                    item.distance_km !== null && (
                      <p className="text-sm text-gray-600">
                        📍 À environ {item.distance_km.toFixed(1)} km
                      </p>
                    )}

                  <p>Budget : {job.budget_amount} $</p>

                  <p>
                    Statut : {getJobStatusLabel(job.status)}
                  </p>

                  <p className="font-bold text-green-600">
                    Score de compatibilité : {item.match_score}
                  </p>

                  {job.status === "open" && !hasApplied && (
                    <button
                      onClick={() => handleApply(job.id)}
                      className="mt-4 bg-black text-white px-4 py-2 rounded"
                    >
                      Postuler
                    </button>
                  )}

                  {hasApplied && job.status === "open" && (
                    <p className="mt-4 text-green-600 font-semibold">
                      Candidature envoyée
                    </p>
                  )}

                  {isAccepted && job.status === "matched" && (
                    <div className="mt-4 space-y-2">
                      <p className="text-blue-600 font-bold">
                        🎉 Tu as obtenu le travail
                      </p>

                      <button
                        onClick={() => handleStartJob(job.id)}
                        className="bg-black text-white px-4 py-2 rounded"
                      >
                        Commencer le travail
                      </button>
                    </div>
                  )}

                  {isAccepted && job.status === "in_progress" && (
                    <div className="mt-4 space-y-2">
                      <p className="text-orange-600 font-bold">
                        Travail en cours
                      </p>

                      <button
                        onClick={() => handleCompleteJob(job.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded"
                      >
                        Terminer le travail
                      </button>
                    </div>
                  )}

                  {isAccepted && job.status === "completed" && (
                    <div className="mt-4 space-y-4">
                      <p className="text-green-700 font-bold">
                        Travail terminé
                      </p>

                      <div>
                        <h3 className="text-lg font-bold mb-3">
                          Laisser un avis au client
                        </h3>

                        <ReviewForm
                          jobId={job.id}
                          targetUserId={job.client_id}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}