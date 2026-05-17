"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import AppNavbar from "@/app/components/AppNavbar";

import ReviewForm from "@/app/components/ReviewForm";

import { apiFetch } from "@/lib/api";

type Application = {
  id: number;

  job_id: number;

  worker_profile_id: number;

  message?: string;

  proposed_rate?: number;

  status: string;

  job?: {
    id: number;

    title: string;

    city?: string;

    region?: string;

    status?: string;

    client_id?: number;
  };
};

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

function getJobStatusLabel(
  status?: string
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
      return status || "Inconnu";
  }
}

export default function WorkerApplicationsPage() {

  const [applications, setApplications] =
    useState<Application[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    async function loadData() {

      try {

        const data =
          await apiFetch(
            "/applications/me"
          );

        setApplications(data);

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);
      }
    }

    loadData();

    const interval =
      setInterval(() => {
        loadData();
      }, 10000);

    return () =>
      clearInterval(interval);

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

        <div className="max-w-4xl mx-auto">

          <div className="mb-8">

            <h1 className="text-3xl md:text-4xl font-bold">
              Mes candidatures
            </h1>

            <p className="mt-3 text-gray-600">
              Consultez les besoins auxquels vous avez postulé
              et le statut de vos candidatures.
            </p>

          </div>

          {applications.length === 0 && (

            <div className="border rounded-2xl bg-white p-8 text-center">

              <p className="text-gray-500">
                Aucune candidature envoyée pour le moment.
              </p>

            </div>

          )}

          <div className="space-y-5">

            {applications.map(
              (application) => (

                <div
                  key={application.id}
                  className="border rounded-2xl bg-white p-6 shadow-sm"
                >

                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                    <div>

                      <p className="text-2xl font-bold">
                        {application.job?.title || "Travail"}
                      </p>

                      <p className="text-gray-600 mt-1">
                        {application.job?.city ||
                          "Ville non précisée"}
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        Région : {application.job?.region || "Témiscaming"}
                      </p>

                    </div>

                    <span
                      className={`inline-flex w-fit px-3 py-1 rounded-full text-sm font-semibold ${getApplicationStatusClass(
                        application.status
                      )}`}
                    >
                      {getApplicationStatusLabel(
                        application.status
                      )}
                    </span>

                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-6">

                    <div className="border rounded-xl p-4">

                      <p className="text-sm text-gray-500">
                        Tarif proposé
                      </p>

                      <p className="font-semibold mt-1">
                        {application.proposed_rate
                          ? `${application.proposed_rate} $`
                          : "Non précisé"}
                      </p>

                    </div>

                    <div className="border rounded-xl p-4">

                      <p className="text-sm text-gray-500">
                        Statut du besoin
                      </p>

                      <p className="font-semibold mt-1">
                        {getJobStatusLabel(
                          application.job?.status
                        )}
                      </p>

                    </div>

                  </div>

                  <div className="mt-5">

                    <p className="text-sm text-gray-500 mb-2">
                      Message envoyé
                    </p>

                    <p className="text-gray-700">
                      {application.message ||
                        "Aucun message"}
                    </p>

                  </div>

                  <div className="flex flex-wrap gap-3 mt-6">

                    <Link
                      href={`/jobs/${application.job_id}`}
                      className="border px-4 py-2 rounded-xl hover:bg-gray-50 transition"
                    >
                      Voir le besoin
                    </Link>

                    {application.job?.client_id && (

                      <Link
                        href={`/clients/${application.job.client_id}`}
                        className="border px-4 py-2 rounded-xl hover:bg-gray-50 transition"
                      >
                        Voir le client
                      </Link>

                    )}

                  </div>

                  {application.status === "accepted" &&
                    application.job?.status === "completed" &&
                    application.job?.client_id && (

                    <div className="mt-6">

                      <h3 className="text-lg font-bold mb-3">
                        Laisser un avis au client
                      </h3>

                      <ReviewForm
                        jobId={application.job.id}
                        targetUserId={
                          application.job.client_id
                        }
                      />

                    </div>

                  )}

                </div>
              )
            )}

          </div>

        </div>

      </main>
    </>
  );
}