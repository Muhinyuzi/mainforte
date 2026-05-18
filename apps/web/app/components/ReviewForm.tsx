"use client";

import { useState } from "react";

import { apiFetch } from "@/lib/api";

type Props = {
  jobId: number;

  targetUserId: number;

  onSuccess?: () => void;
};

export default function ReviewForm({
  jobId,
  targetUserId,
  onSuccess,
}: Props) {

  const [rating, setRating] =
    useState(5);

  const [comment, setComment] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  const [alreadyReviewed, setAlreadyReviewed] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function handleSubmit(
    e: React.FormEvent
  ) {

    e.preventDefault();

    try {

      setLoading(true);

      setError(null);

      await apiFetch("/reviews", {
        method: "POST",

        body: JSON.stringify({
          job_id: jobId,

          target_user_id:
            targetUserId,

          rating,

          comment,
        }),
      });

      setSuccess(true);

      if (onSuccess) {
        onSuccess();
      }

    } catch (error: any) {

      const message =
        error?.message || "";

      if (
        message.includes(
          "Review already submitted"
        )
      ) {
        setAlreadyReviewed(true);
        return;
      }

      console.error(error);

      setError(
        "Impossible d’envoyer l’avis."
      );

    } finally {

      setLoading(false);
    }
  }

  if (success) {

    return (

      <div className="border rounded-2xl p-5 bg-green-50 border-green-200">

        <p className="font-semibold text-green-700">
          Avis envoyé avec succès.
        </p>

      </div>

    );
  }

  if (alreadyReviewed) {

    return (

      <div className="border rounded-2xl p-5 bg-blue-50 border-blue-200">

        <p className="font-semibold text-blue-700">
          Avis déjà envoyé pour cette mission.
        </p>

      </div>

    );
  }

  return (

    <form
      onSubmit={handleSubmit}
      className="border rounded-2xl p-5 bg-gray-50 space-y-4"
    >

      <div>

        <label className="block mb-2 font-medium">
          Note
        </label>

        <select
          value={rating}

          onChange={(e) =>
            setRating(
              Number(e.target.value)
            )
          }

          className="w-full border rounded-xl px-4 py-3 bg-white"
        >

          <option value={5}>
            ⭐⭐⭐⭐⭐ — Excellent
          </option>

          <option value={4}>
            ⭐⭐⭐⭐ — Très bien
          </option>

          <option value={3}>
            ⭐⭐⭐ — Correct
          </option>

          <option value={2}>
            ⭐⭐ — Mauvais
          </option>

          <option value={1}>
            ⭐ — Très mauvais
          </option>

        </select>

      </div>

      <div>

        <label className="block mb-2 font-medium">
          Commentaire
        </label>

        <textarea
          value={comment}

          onChange={(e) =>
            setComment(
              e.target.value
            )
          }

          rows={4}

          className="w-full border rounded-xl px-4 py-3 bg-white"

          placeholder="Partagez votre expérience..."
        />

      </div>

      {error && (

        <p className="text-red-600 text-sm">
          {error}
        </p>

      )}

      <button
        type="submit"

        disabled={loading}

        className="bg-black text-white px-5 py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60"
      >

        {loading
          ? "Envoi..."
          : "Envoyer l’avis"}

      </button>

    </form>
  );
}