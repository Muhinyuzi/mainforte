"use client";

import Link from "next/link";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import AppNavbar from "@/app/components/AppNavbar";

import ReviewForm from "@/app/components/ReviewForm";

import { apiFetch } from "@/lib/api";

type User = {
  id: number;

  can_work: boolean;

  can_hire: boolean;
};

type Job = {
  id: number;

  title: string;

  city: string;

  region: string;

  budget_amount: number;

  status: string;
};

type Application = {
  id: number;

  worker_profile_id: number;

  message?: string;

  proposed_rate?: number;

  status: string;

  worker: {
    id: number;

    full_name: string;

    city?: string;

    skills?: string;

    hourly_rate?: number;
  };
};

function getJobStatusLabel(
  status: string
) {
  switch (status) {

    case "open":
      return "Ouvert";

    case "matched":
      return "Travailleur trouvé";

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

function getJobStatusClass(
  status: string
) {
  switch (status) {

    case "open":
      return "bg-blue-100 text-blue-800";

    case "matched":
      return "bg-purple-100 text-purple-800";

    case "in_progress":
      return "bg-orange-100 text-orange-800";

    case "completed":
      return "bg-green-100 text-green-800";

    case "cancelled":
      return "bg-red-100 text-red-800";

    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getApplicationStatusLabel(
  status: string
) {
  switch (status) {

    case "pending":
      return "En attente";

    case "accepted":
      return "Acceptée";

    case "rejected":
      return "Refusée";

    default:
      return status;
  }
}

function getApplicationStatusClass(
  status: string
) {
  switch (status) {

    case "pending":
      return "bg-yellow-100 text-yellow-800";

    case "accepted":
      return "bg-green-100 text-green-800";

    case "rejected":
      return "bg-red-100 text-red-800";

    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function ClientDashboard() {

  const router = useRouter();

  const [jobs, setJobs] =
    useState<Job[]>([]);

  const [applicationsMap, setApplicationsMap] =
    useState<
      Record<number, Application[]>
    >({});

  const [toast, setToast] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const showToast = useCallback(
    (message: string) => {

      setToast(message);

      setTimeout(() => {
        setToast(null);
      }, 3000);

    },
    []
  );

  const loadData = useCallback(
    async () => {

      try {

        const me: User =
          await apiFetch("/users/me");

        if (!me.can_hire) {

          router.push(
            "/worker/dashboard"
          );

          return;
        }

        const jobsData: Job[] =
          await apiFetch("/jobs");

        const map:
          Record<number, Application[]> = {};

        await Promise.all(
          jobsData.map(
            async (job) => {

              const applications:
                Application[] =
                  await apiFetch(
                    `/applications/jobs/${job.id}`
                  );

              map[job.id] =
                applications;
            }
          )
        );

        setJobs(jobsData);

        setApplicationsMap(map);

      } catch (error) {

        console.error(error);

        showToast(
          "Erreur lors du chargement des données"
        );

      } finally {

        setLoading(false);
      }
    },
    [router, showToast]
  );

  useEffect(() => {

    loadData();

    const interval =
      setInterval(() => {
        loadData();
      }, 5000);

    return () =>
      clearInterval(interval);

  }, [loadData]);

  async function handleAccept(
    applicationId: number
  ) {

    try {

      await apiFetch(
        `/applications/${applicationId}/accept`,
        {
          method: "PATCH",
        }
      );

      showToast(
        "Candidature acceptée"
      );

      loadData();

    } catch (error) {

      console.error(error);

      showToast(
        "Erreur lors de l’acceptation"
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
            Mes besoins
          </h1>

          <p className="mt-2 text-gray-600">
            Consultez vos besoins publiés,
            les candidatures reçues
            et l’avancement des travaux.
          </p>

        </div>

        <div className="space-y-6">

          {jobs.length === 0 && (

            <div className="border rounded-2xl p-8 bg-white text-center">

              <h2 className="text-2xl font-bold mb-3">
                Aucun besoin publié
              </h2>

              <p className="text-gray-600 mb-5">
                Publiez votre premier besoin
                pour trouver de l’aide rapidement.
              </p>

              <button
                onClick={() =>
                  router.push(
                    "/client/post-job"
                  )
                }
                className="bg-black text-white px-5 py-3 rounded-xl"
              >
                Publier un besoin
              </button>

            </div>

          )}

          {jobs.map((job) => {

            const applications =
              applicationsMap[job.id] || [];

            const acceptedApplication =
              applications.find(
                (application) =>
                  application.status ===
                  "accepted"
              );

            return (

              <div
                key={job.id}
                className="border rounded-lg p-6 bg-white"
              >

                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                  <div>

                    <h2 className="text-2xl font-bold">
                      {job.title}
                    </h2>

                    <p className="mt-2">
                      Ville : {job.city}
                    </p>

                    <p className="text-sm text-gray-600">
                      Région : Témiscaming
                    </p>

                    <p>
                      Budget :
                      {" "}
                      {job.budget_amount} $
                    </p>

                  </div>

                  <span
                    className={`inline-block w-fit px-3 py-1 rounded-full text-sm font-semibold ${getJobStatusClass(
                      job.status
                    )}`}
                  >
                    {getJobStatusLabel(
                      job.status
                    )}
                  </span>

                </div>

                <div className="mt-4 flex flex-wrap gap-3">

                  <button
                    onClick={() =>
                      router.push(
                        `/jobs/${job.id}`
                      )
                    }
                    className="border px-4 py-2 rounded"
                  >
                    Voir détails
                  </button>

                  {acceptedApplication && (

                    <button
                      onClick={() =>
                        router.push(
                          "/messages"
                        )
                      }
                      className="bg-black text-white px-4 py-2 rounded"
                    >
                      Messages
                    </button>

                  )}

                </div>

                {acceptedApplication && (

                  <div className="mt-5 border rounded-lg p-4 bg-gray-50">

                    <p className="font-semibold">

                      Travailleur sélectionné :
                      {" "}

                      <Link
                        href={`/workers/${acceptedApplication.worker.id}`}
                        className="text-blue-600 hover:underline font-semibold"
                      >
                        {acceptedApplication.worker.full_name}
                      </Link>

                    </p>

                    <p className="text-sm text-gray-600">

                      Statut du besoin :
                      {" "}

                      {getJobStatusLabel(
                        job.status
                      )}

                    </p>

                    {job.status ===
                      "matched" && (

                      <p className="text-sm text-gray-600 mt-1">

                        En attente que le travailleur commence le travail.

                      </p>

                    )}

                    {job.status ===
                      "in_progress" && (

                      <p className="text-sm text-orange-700 mt-1 font-medium">

                        Le travail est en cours.

                      </p>

                    )}

                    {job.status ===
                      "completed" && (

                      <>
                        <p className="text-sm text-green-700 mt-1 font-medium">

                          Le travail est terminé.

                        </p>

                        <div className="mt-6">

                          <h3 className="text-lg font-bold mb-3">
                            Laisser un avis au travailleur
                          </h3>

                          <ReviewForm
                            jobId={job.id}
                            targetUserId={
                              acceptedApplication.worker.id
                            }
                          />

                        </div>

                      </>

                    )}

                  </div>

                )}

                <div className="mt-6">

                  <h3 className="font-semibold text-lg mb-3">
                    Candidatures reçues
                  </h3>

                  <div className="space-y-3">

                    {applications.length === 0 && (

                      <p className="text-gray-600">
                        Aucune candidature pour le moment.
                      </p>

                    )}

                    {applications.map(
                      (application) => (

                        <div
                          key={application.id}
                          className="border rounded p-4 bg-white"
                        >

                          <div className="mb-4 flex flex-col md:flex-row md:items-start md:justify-between gap-3">

                            <div>

                              <Link
                                href={`/workers/${application.worker.id}`}
                                className="font-bold text-lg text-blue-600 hover:underline"
                              >
                                {application.worker.full_name}
                              </Link>

                              <p className="text-sm text-gray-600">

                                Ville :
                                {" "}

                                {application.worker.city ||
                                  "Non précisée"}

                              </p>

                              <p className="text-sm text-gray-600">

                                Compétences :
                                {" "}

                                {application.worker.skills ||
                                  "Non précisées"}

                              </p>

                              <p className="text-sm text-gray-600">

                                Tarif :
                                {" "}

                                {application.worker.hourly_rate
                                  ? `${application.worker.hourly_rate} $/h`
                                  : "Non précisé"}

                              </p>

                            </div>

                            <span
                              className={`inline-block w-fit px-3 py-1 rounded-full text-sm font-semibold ${getApplicationStatusClass(
                                application.status
                              )}`}
                            >
                              {getApplicationStatusLabel(
                                application.status
                              )}
                            </span>

                          </div>

                          <p>
                            Message :
                            {" "}

                            {application.message ||
                              "Aucun message"}

                          </p>

                          <p>
                            Tarif proposé :
                            {" "}

                            {application.proposed_rate
                              ? `${application.proposed_rate} $`
                              : "Non précisé"}

                          </p>

                          {application.status ===
                            "pending" &&
                            job.status ===
                              "open" && (

                            <button
                              onClick={() =>
                                handleAccept(
                                  application.id
                                )
                              }
                              className="mt-4 bg-black text-white px-4 py-2 rounded"
                            >
                              Accepter
                            </button>

                          )}

                        </div>
                      )
                    )}

                  </div>

                </div>

              </div>

            );
          })}

        </div>

      </div>
    </>
  );
}