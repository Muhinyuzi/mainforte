"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { useRouter } from "next/navigation";

import { apiFetch } from "@/lib/api";

import AppNavbar from "@/app/components/AppNavbar";

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
  availability_type: string;
  status: string;
};

type MatchJob = {
  job: {
    id: number;
    title: string;
    description?: string;
    city: string;
    budget_amount: number;
    status: string;
  };
  match_score: number;
};

type Application = {
  id: number;
  job_id: number;
  worker_profile_id: number;
  status: string;
};

export default function WorkerDashboard() {

  const [user, setUser] =
    useState<User | null>(null);

  const [availabilities,
    setAvailabilities] =
    useState<Availability[]>([]);

  const [jobs, setJobs] =
    useState<MatchJob[]>([]);

  const [appliedJobs,
    setAppliedJobs] =
    useState<number[]>([]);

  const [newJobIds,
    setNewJobIds] =
    useState<number[]>([]);

  const [toast, setToast] =
    useState<string | null>(null);

  const [acceptedJobIds,
    setAcceptedJobIds] =
    useState<number[]>([]);

  const [loading, setLoading] =
    useState(true);

  const router = useRouter();  

  function showToast(message: string) {

    setToast(message);

    setTimeout(() => {
      setToast(null);
    }, 3000);
  }

  useEffect(() => {

    async function loadData() {

      try {

        const me =
          await apiFetch(
            "/users/me"
          );

        if (!me.can_work) {
          router.push("/client/dashboard");
          return;
        }  

        const myAvailabilities =
          await apiFetch(
            "/availabilities/me"
          );

        const jobsData =
          await apiFetch(
            "/workers/jobs/matches"
          );

        const myApplications =
          await apiFetch(
            "/applications/me"
          );

        setUser(me);

        setAvailabilities(
          myAvailabilities
        );

        setJobs((prevJobs) => {

          const previousIds =
            prevJobs.map(
              (item) =>
                item.job.id
            );

          const incomingIds =
            jobsData.map(
              (item: MatchJob) =>
                item.job.id
            );

          const newIds =
            incomingIds.filter(
              (id: number) =>
                !previousIds.includes(id)
            );

          if (
            previousIds.length > 0
          ) {
            setNewJobIds(newIds);
          }

          return jobsData;
        });

        setAppliedJobs(
          myApplications.map(
            (
              application: Application
            ) =>
              application.job_id
          )
        );

        const acceptedIds =
          myApplications
            .filter(
              (
                application: Application
              ) =>
                application.status ===
                "accepted"
            )
            .map(
              (
                application: Application
              ) =>
                application.job_id
            );

        setAcceptedJobIds(
          acceptedIds
        );

        if (
          acceptedIds.length > 0
        ) {
          showToast(
            "🎉 You got the job!"
          );
        }

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

  async function handleApply(
    jobId: number
  ) {

    try {

      await apiFetch(
        `/applications/jobs/${jobId}`,
        {
          method: "POST",

          body: JSON.stringify({
            message:
              "Disponible immédiatement.",

            proposed_rate: 28,
          }),
        }
      );

      showToast(
        "Application sent!"
      );

      setAppliedJobs(
        (prev) => [
          ...prev,
          jobId,
        ]
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
            Worker Dashboard
          </h1>

          <p className="mt-2 text-gray-600">
            Welcome {user?.full_name}
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">
            My Availabilities
          </h2>

          <div className="space-y-3">

            {availabilities.map(
              (availability) => (

                <div
                  key={availability.id}
                  className="border rounded-lg p-4"
                >

                  <p>
                    City:{" "}
                    {
                      availability.city
                    }
                  </p>

                  <p>
                    Type:{" "}
                    {
                      availability.availability_type
                    }
                  </p>

                  <p>
                    Status:{" "}
                    {
                      availability.status
                    }
                  </p>

                </div>
              )
            )}

          </div>
        </div>

        <div>

          <h2 className="text-2xl font-semibold mb-4">
            Matching Jobs
          </h2>

          <div className="space-y-3">

            {jobs.map((item) => {

              const job = item.job;

              return (

                <div
                  key={job.id}
                  className="border rounded-lg p-4"
                >

                  <Link
                    href={`/jobs/${job.id}`}
                    className="font-bold text-lg text-blue-600 hover:underline"
                  >
                    {job.title}
                  </Link>

                  {newJobIds.includes(
                    job.id
                  ) && (

                    <span className="inline-block ml-3 bg-green-500 text-white text-xs px-2 py-1 rounded">
                      NEW
                    </span>

                  )}

                  <p>
                    City: {job.city}
                  </p>

                  <p>
                    Budget: $
                    {
                      job.budget_amount
                    }
                  </p>

                  <p>
                    Status:
                    {" "}
                    {job.status}
                  </p>

                  <p className="font-bold text-green-600">
                    Match Score:
                    {" "}
                    {item.match_score}
                  </p>

                  {job.status ===
                    "open" &&
                    !appliedJobs.includes(
                      job.id
                    ) && (

                    <button
                      onClick={() =>
                        handleApply(
                          job.id
                        )
                      }
                      className="mt-4 bg-black text-white px-4 py-2 rounded"
                    >
                      Apply
                    </button>

                  )}

                  {appliedJobs.includes(
                    job.id
                  ) && (

                    <p className="mt-4 text-green-600 font-semibold">
                      Application sent
                    </p>

                  )}

                  {acceptedJobIds.includes(
                    job.id
                  ) && (

                    <p className="mt-2 text-blue-600 font-bold">
                      🎉 You got the job
                    </p>

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