"use client";

import { useEffect, useState } from "react";

import AppNavbar from "@/app/components/AppNavbar";

import { apiFetch } from "@/lib/api";

type Job = {
  id: number;
  title: string;
  city: string;
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

export default function ClientDashboard() {
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

  function showToast(message: string) {
    setToast(message);

    setTimeout(() => {
      setToast(null);
    }, 3000);
  }

  useEffect(() => {
    async function loadData() {
      try {
        const jobsData =
          await apiFetch("/jobs");

        setJobs(jobsData);

        const map: Record<
          number,
          Application[]
        > = {};

        for (const job of jobsData) {
          const applications =
            await apiFetch(
              `/applications/jobs/${job.id}`
            );

          map[job.id] =
            applications;
        }

        setApplicationsMap(map);
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
      }, 5000);

    return () =>
      clearInterval(interval);
  }, []);

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
        "Application accepted"
      );

      window.location.reload();
    } catch (error) {
      console.error(error);

      showToast("Failed");
    }
  }

  if (loading) {
    return (
      <>
        <AppNavbar />

        <div className="p-10">
          Loading...
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
            Client Dashboard
          </h1>
        </div>

        <div className="space-y-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="border rounded-lg p-6"
            >
              <h2 className="text-2xl font-bold">
                {job.title}
              </h2>

              <p className="mt-2">
                City: {job.city}
              </p>

              <p>
                Budget: $
                {job.budget_amount}
              </p>

              <p>
                Status: {job.status}
              </p>

              <div className="mt-6">
                <h3 className="font-semibold text-lg mb-3">
                  Applications
                </h3>

                <div className="space-y-3">
                  {applicationsMap[
                    job.id
                  ]?.map(
                    (application) => (
                      <div
                        key={
                          application.id
                        }
                        className="border rounded p-4 bg-white"
                      >
                        <div className="mb-4">
                          <p className="font-bold text-lg">
                            {
                              application.worker.full_name
                            }
                          </p>

                          <p className="text-sm text-gray-600">
                            {
                              application.worker.city
                            }
                          </p>

                          <p className="text-sm text-gray-600">
                            Skills:{" "}
                            {
                              application.worker.skills
                            }
                          </p>

                          <p className="text-sm text-gray-600">
                            Rate: $
                            {
                              application.worker.hourly_rate
                            }
                            /h
                          </p>
                        </div>

                        <p>
                          Message:{" "}
                          {
                            application.message
                          }
                        </p>

                        <p>
                          Proposed Rate: $
                          {
                            application.proposed_rate
                          }
                        </p>

                        <p>
                          Status:{" "}
                          {
                            application.status
                          }
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
                              Accept
                            </button>
                          )}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}