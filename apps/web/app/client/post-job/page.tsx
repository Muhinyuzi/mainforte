"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import AppNavbar from "@/app/components/AppNavbar";

import { apiFetch } from "@/lib/api";

export default function PostJobPage() {
  const router = useRouter();

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [city, setCity] =
    useState("Ville-Marie");

  const [budget, setBudget] =
    useState(30);

  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    try {
      setLoading(true);

      await apiFetch("/jobs", {
        method: "POST",
        body: JSON.stringify({
          category_id: 1,

          title,

          description,

          city,

          address_optional:
            "Adresse client",

          needed_at:
            new Date().toISOString(),

          duration_estimate_hours: 4,

          urgency: "today",

          budget_type: "hourly",

          budget_amount: budget,
        }),
      });

      alert("Job created!");

      router.push(
        "/client/dashboard"
      );
    } catch (error) {
      console.error(error);

      alert("Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
  <>
    <AppNavbar />
    <div className="min-h-screen p-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">
          Post a Job
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 border rounded-lg p-8"
        >
          <div>
            <label className="block mb-2 font-medium">
              Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }
              className="w-full border p-3 rounded"
              placeholder="Besoin aide déménagement"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              className="w-full border p-3 rounded"
              rows={4}
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              City
            </label>

            <input
              type="text"
              value={city}
              onChange={(e) =>
                setCity(
                  e.target.value
                )
              }
              className="w-full border p-3 rounded"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Budget ($)
            </label>

            <input
              type="number"
              value={budget}
              onChange={(e) =>
                setBudget(
                  Number(
                    e.target.value
                  )
                )
              }
              className="w-full border p-3 rounded"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-6 py-3 rounded"
          >
            {loading
              ? "Creating..."
              : "Create Job"}
          </button>
        </form>
      </div>
    </div>
    </>
  );
  
}