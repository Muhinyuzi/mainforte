"use client";

import {
  useEffect,
  useState
} from "react";

import AppNavbar from "@/app/components/AppNavbar";

import { apiFetch } from "@/lib/api";

import { TEMISCAMING_CITIES } from "@/lib/constants/regions";

type User = {
  id: number;
  full_name: string;
  bio?: string;
  city?: string;
  skills?: string;
  hourly_rate?: number;
  profile_picture_url?: string;
  can_work: boolean;
  can_hire: boolean;
};

export default function ProfileSettingsPage() {

  const [user, setUser] =
    useState<User | null>(null);

  const [bio, setBio] =
    useState("");

  const [city, setCity] =
    useState("Ville-Marie");

  const [skills, setSkills] =
    useState("");

  const [hourlyRate,
    setHourlyRate] =
    useState<number>(0);

  const [profilePictureUrl,
    setProfilePictureUrl] =
    useState("");

  const [canWork, setCanWork] =
    useState(false);

  const [canHire, setCanHire] =
    useState(true);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [toast, setToast] =
    useState<string | null>(null);

  useEffect(() => {

    async function loadUser() {

      try {

        const data =
          await apiFetch(
            "/users/me"
          );

        setUser(data);

        setBio(data.bio || "");

        setCity(
          data.city &&
          TEMISCAMING_CITIES.includes(
            data.city
          )
            ? data.city
            : "Ville-Marie"
        );

        setSkills(
          data.skills || ""
        );

        setHourlyRate(
          data.hourly_rate || 0
        );

        setProfilePictureUrl(
          data.profile_picture_url || ""
        );

        setCanWork(
          data.can_work || false
        );

        setCanHire(
          data.can_hire ?? true
        );

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);
      }
    }

    loadUser();

  }, []);

  function showToast(
    message: string
  ) {

    setToast(message);

    setTimeout(() => {
      setToast(null);
    }, 3000);
  }

  async function handleSave() {

    if (!canWork && !canHire) {

      showToast(
        "Sélectionnez au moins une option."
      );

      return;
    }

    try {

      setSaving(true);

      const data =
        await apiFetch(
          "/users/me",
          {
            method: "PATCH",

            body: JSON.stringify({
              bio,
              city,
              skills:
                canWork
                  ? skills
                  : "",
              hourly_rate:
                canWork
                  ? hourlyRate
                  : null,
              profile_picture_url:
                profilePictureUrl,
              can_work:
                canWork,
              can_hire:
                canHire,
            }),
          }
        );

      setUser(data);

      showToast(
        "Profil mis à jour"
      );

    } catch (error) {

      console.error(error);

      showToast(
        "Impossible d’enregistrer"
      );

    } finally {

      setSaving(false);
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

      <div className="p-10 max-w-3xl mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          Paramètres du profil
        </h1>

        <div className="border rounded-2xl p-8 bg-white space-y-6">

          <div className="rounded-xl border border-blue-200 bg-blue-50 text-blue-800 px-4 py-3 text-sm">
            MainForte est actuellement disponible dans la région du Témiscaming.
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Nom complet
            </label>

            <input
              type="text"
              value={
                user?.full_name || ""
              }
              disabled
              className="w-full border rounded-xl px-4 py-3 bg-gray-100"
            />
          </div>

          <div>
            <label className="block mb-3 font-medium">
              Je veux utiliser MainForte pour
            </label>

            <div className="space-y-3">

              <label className="flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={canWork}
                  onChange={(e) =>
                    setCanWork(
                      e.target.checked
                    )
                  }
                />

                <span>
                  Trouver du travail local
                </span>
              </label>

              <label className="flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={canHire}
                  onChange={(e) =>
                    setCanHire(
                      e.target.checked
                    )
                  }
                />

                <span>
                  Publier des besoins et engager
                </span>
              </label>

            </div>
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Bio
            </label>

            <textarea
              value={bio}
              onChange={(e) =>
                setBio(
                  e.target.value
                )
              }
              rows={4}
              className="w-full border rounded-xl px-4 py-3"
              placeholder="Présentez-vous brièvement..."
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Ville
            </label>

            <select
              value={city}
              onChange={(e) =>
                setCity(
                  e.target.value
                )
              }
              className="w-full border rounded-xl px-4 py-3"
              required
            >

              {TEMISCAMING_CITIES.map(
                (cityName) => (

                  <option
                    key={cityName}
                    value={cityName}
                  >
                    {cityName}
                  </option>

                )
              )}

            </select>

            <p className="text-sm text-gray-500 mt-2">
              Région : Témiscaming
            </p>
          </div>

          {canWork && (
            <>
              <div>
                <label className="block mb-2 font-medium">
                  Compétences
                </label>

                <input
                  type="text"
                  value={skills}
                  onChange={(e) =>
                    setSkills(
                      e.target.value
                    )
                  }
                  placeholder="Déménagement, ménage, jardinage..."
                  className="w-full border rounded-xl px-4 py-3"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  Tarif horaire ($)
                </label>

                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) =>
                    setHourlyRate(
                      Number(
                        e.target.value
                      )
                    )
                  }
                  className="w-full border rounded-xl px-4 py-3"
                />
              </div>
            </>
          )}

          <div>
            <label className="block mb-2 font-medium">
              URL de photo de profil
            </label>

            <input
              type="text"
              value={
                profilePictureUrl
              }
              onChange={(e) =>
                setProfilePictureUrl(
                  e.target.value
                )
              }
              className="w-full border rounded-xl px-4 py-3"
              placeholder="https://..."
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-black text-white px-6 py-3 rounded-xl"
          >
            {saving
              ? "Enregistrement..."
              : "Enregistrer le profil"}
          </button>

        </div>

      </div>
    </>
  );
}