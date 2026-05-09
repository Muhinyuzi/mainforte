"use client";

import {
  useEffect,
  useState
} from "react";

import AppNavbar from "@/app/components/AppNavbar";

import { apiFetch } from "@/lib/api";

type User = {
  id: number;
  full_name: string;
  bio?: string;
  city?: string;
  skills?: string;
  hourly_rate?: number;
  profile_picture_url?: string;
};

export default function ProfileSettingsPage() {

  const [user, setUser] =
    useState<User | null>(null);

  const [bio, setBio] =
    useState("");

  const [city, setCity] =
    useState("");

  const [skills, setSkills] =
    useState("");

  const [hourlyRate,
    setHourlyRate] =
    useState<number>(0);

  const [profilePictureUrl,
    setProfilePictureUrl] =
    useState("");

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

        setCity(data.city || "");

        setSkills(
          data.skills || ""
        );

        setHourlyRate(
          data.hourly_rate || 0
        );

        setProfilePictureUrl(
          data.profile_picture_url || ""
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
              skills,
              hourly_rate:
                hourlyRate,
              profile_picture_url:
                profilePictureUrl,
            }),
          }
        );

      setUser(data);

      showToast(
        "Profile updated"
      );

    } catch (error) {

      console.error(error);

      showToast(
        "Failed to save"
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

      <div className="p-10 max-w-3xl mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          Profile Settings
        </h1>

        <div className="border rounded-2xl p-8 bg-white space-y-6">

          <div>
            <label className="block mb-2 font-medium">
              Full Name
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

              className="w-full border rounded-xl px-4 py-3"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Skills
            </label>

            <input
              type="text"

              value={skills}

              onChange={(e) =>
                setSkills(
                  e.target.value
                )
              }

              placeholder="Moving, Cleaning, Gardening"

              className="w-full border rounded-xl px-4 py-3"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Hourly Rate ($)
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

          <div>
            <label className="block mb-2 font-medium">
              Profile Picture URL
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
            />
          </div>

          <button
            onClick={handleSave}

            disabled={saving}

            className="bg-black text-white px-6 py-3 rounded-xl"
          >

            {saving
              ? "Saving..."
              : "Save Profile"}

          </button>

        </div>

      </div>
    </>
  );
}