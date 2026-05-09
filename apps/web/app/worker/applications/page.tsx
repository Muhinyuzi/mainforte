"use client";

import { useEffect, useState } from "react";

import AppNavbar from "@/app/components/AppNavbar";

import { apiFetch } from "@/lib/api";

type Application = {
  id: number;
  job_id: number;
  worker_profile_id: number;
  message?: string;
  proposed_rate?: number;
  status: string;
};

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
          Loading...
        </div>
      </>
    );
  }

  return (
    <>
      <AppNavbar />

      <div className="p-10">
        <h1 className="text-4xl font-bold mb-8">
          My Applications
        </h1>

        <div className="space-y-4">
          {applications.map(
            (application) => (
              <div
                key={application.id}
                className="border rounded-lg p-5"
              >
                <p>
                  Job ID:{" "}
                  {application.job_id}
                </p>

                <p>
                  Proposed Rate: $
                  {
                    application.proposed_rate
                  }
                </p>

                <p>
                  Message:{" "}
                  {application.message}
                </p>

                <div className="mt-3">
                  {application.status ===
                    "pending" && (
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-sm font-semibold">
                      Pending
                    </span>
                  )}

                  {application.status ===
                    "accepted" && (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm font-semibold">
                      Accepted
                    </span>
                  )}

                  {application.status ===
                    "rejected" && (
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm font-semibold">
                      Rejected
                    </span>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
}