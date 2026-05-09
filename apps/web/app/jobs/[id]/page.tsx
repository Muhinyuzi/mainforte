"use client";

import { use, useEffect, useState } from "react";

import AppNavbar from "@/app/components/AppNavbar";

import { apiFetch } from "@/lib/api";

type Job = {
  id: number;
  title: string;
  description?: string;
  city: string;
  address_optional?: string;
  budget_amount: number;
  duration_estimate_hours?: number;
  urgency?: string;
  status: string;
  needed_at?: string;
};

export default function JobDetailPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const resolvedParams = use(params);

  const [job, setJob] =
    useState<Job | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [applied, setApplied] =
    useState(false);

  const [toast, setToast] =
    useState<string | null>(null);

  useEffect(() => {
    async function loadJob() {
      try {
        const data =
          await apiFetch(
            `/jobs/${resolvedParams.id}`
          );

        setJob(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadJob();
  }, [resolvedParams.id]);

  function showToast(message: string) {
    setToast(message);

    setTimeout(() => {
      setToast(null);
    }, 3000);
  }

  async function handleApply() {
    if (!job) return;

    try {
      await apiFetch(
        `/applications/jobs/${job.id}`,
        {
          method: "POST",
          body: JSON.stringify({
            message:
              "Disponible immédiatement.",
            proposed_rate: 28,
          }),
        }
      );

      setApplied(true);

      showToast(
        "Application sent!"
      );
    } catch (error) {
      console.error(error);

      showToast(
        "Failed to apply"
      );
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

  if (!job) {
    return (
      <>
        <AppNavbar />

        <div className="p-10">
          Job not found
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

      <div className="p-10">
        <div className="max-w-3xl border rounded-lg p-8">
          <h1 className="text-4xl font-bold mb-4">
            {job.title}
          </h1>

          <p className="text-gray-600 mb-6">
            {job.description}
          </p>

          <div className="space-y-3">
            <p>
              <strong>City:</strong>{" "}
              {job.city}
            </p>

            <p>
              <strong>Address:</strong>{" "}
              {job.address_optional}
            </p>

            <p>
              <strong>Budget:</strong>{" "}
              ${job.budget_amount}
            </p>

            <p>
              <strong>Duration:</strong>{" "}
              {
                job.duration_estimate_hours
              }h
            </p>

            <p>
              <strong>Urgency:</strong>{" "}
              {job.urgency}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {job.status}
            </p>

            <p>
              <strong>Needed At:</strong>{" "}
              {job.needed_at}
            </p>
          </div>

          <div className="mt-8">
            {!applied &&
              job.status === "open" && (
                <button
                  onClick={handleApply}
                  className="bg-black text-white px-6 py-3 rounded"
                >
                  Apply
                </button>
              )}

            {applied && (
              <p className="text-green-600 font-bold">
                Application sent
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}