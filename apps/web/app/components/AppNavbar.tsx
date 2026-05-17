"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { apiFetch } from "@/lib/api";
import { logout } from "@/lib/auth";

type User = {
  id: number;
  full_name: string;
  role: string;
  can_work: boolean;
  can_hire: boolean;
};

type Notifications = {
  total: number;
  messages: number;
  pending_applications: number;
  accepted_jobs: number;
  completed_jobs: number;
  reviews_received: number;
  unread_job_activities: number;
};

function Badge({
  count,
}: {
  count?: number;
}) {
  if (!count || count <= 0) {
    return null;
  }

  return (
    <span className="ml-1 inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-xs font-bold">
      {count}
    </span>
  );
}

export default function AppNavbar() {
  const router = useRouter();

  const [user, setUser] =
    useState<User | null>(null);

  const [notifications, setNotifications] =
    useState<Notifications | null>(null);

  const [menuOpen, setMenuOpen] =
    useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await apiFetch("/users/me");
        setUser(data);
      } catch {
        setUser(null);
      }
    }

    loadUser();
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    async function loadNotifications() {
      try {
        const data =
          await apiFetch("/notifications/me");

        setNotifications(data);
      } catch (error) {
        console.error(error);
      }
    }

    loadNotifications();

    const interval = setInterval(() => {
      loadNotifications();
    }, 10000);

    return () => clearInterval(interval);
  }, [user]);

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleLogout() {
    logout();
    closeMenu();

    router.push("/login");
  }

  return (
    <nav className="border-b bg-white px-4 md:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/"
          onClick={closeMenu}
          className="text-2xl font-black tracking-tight hover:opacity-80 transition"
        >
          Main
          <span className="text-blue-600">
            Forte
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {user?.can_work && (
            <>
              <Link
                href="/worker/dashboard"
                className="hover:text-blue-600"
              >
                Espace travailleur
                <Badge
                  count={
                    (notifications?.accepted_jobs || 0) +
                    (notifications?.completed_jobs || 0)
                  }
                />
              </Link>

              <Link
                href="/worker/applications"
                className="hover:text-blue-600"
              >
                Mes candidatures
              </Link>
            </>
          )}

          {user?.can_hire && (
            <>
              <Link
                href="/client/dashboard"
                className="hover:text-blue-600"
              >
                Mes besoins
                <Badge
                  count={
                    notifications?.unread_job_activities
                  }
                />
              </Link>

              <Link
                href="/client/post-job"
                className="hover:text-blue-600"
              >
                Publier un besoin
              </Link>
            </>
          )}

          {user && (
            <>
              <Link
                href="/messages"
                className="hover:text-blue-600"
              >
                Messages
                <Badge
                  count={notifications?.messages}
                />
              </Link>

              <Link
                href="/settings/profile"
                className="hover:text-blue-600"
              >
                Profil
              </Link>
            </>
          )}

          {!user && (
            <>
              <Link
                href="/login"
                className="hover:text-blue-600"
              >
                Connexion
              </Link>

              <Link
                href="/register"
                className="bg-black text-white px-4 py-2 rounded"
              >
                Inscription
              </Link>
            </>
          )}

          {user && (
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-600">
                {user.full_name}
              </p>

              {notifications &&
                notifications.total > 0 && (
                  <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                    {notifications.total} alerte
                    {notifications.total > 1 ? "s" : ""}
                  </span>
                )}

              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Déconnexion
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() =>
            setMenuOpen((prev) => !prev)
          }
          className="md:hidden border rounded-lg px-3 py-2 text-sm font-semibold"
        >
          {menuOpen ? "Fermer" : "Menu"}
          <Badge count={notifications?.total} />
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden mt-3 border-t pt-3 space-y-2">
          {user?.can_work && (
            <>
              <Link
                href="/worker/dashboard"
                onClick={closeMenu}
                className="block py-2 hover:text-blue-600"
              >
                Espace travailleur
                <Badge
                  count={
                    (notifications?.accepted_jobs || 0) +
                    (notifications?.completed_jobs || 0)
                  }
                />
              </Link>

              <Link
                href="/worker/applications"
                onClick={closeMenu}
                className="block py-2 hover:text-blue-600"
              >
                Mes candidatures
              </Link>
            </>
          )}

          {user?.can_hire && (
            <>
              <Link
                href="/client/dashboard"
                onClick={closeMenu}
                className="block py-2 hover:text-blue-600"
              >
                Mes besoins
                <Badge
                  count={
                    notifications?.unread_job_activities
                  }
                />
              </Link>

              <Link
                href="/client/post-job"
                onClick={closeMenu}
                className="block py-2 hover:text-blue-600"
              >
                Publier un besoin
              </Link>
            </>
          )}

          {user && (
            <>
              <Link
                href="/messages"
                onClick={closeMenu}
                className="block py-2 hover:text-blue-600"
              >
                Messages
                <Badge
                  count={notifications?.messages}
                />
              </Link>

              <Link
                href="/settings/profile"
                onClick={closeMenu}
                className="block py-2 hover:text-blue-600"
              >
                Profil
              </Link>

              <div className="pt-3 border-t">
                <p className="text-sm text-gray-600 mb-3">
                  {user.full_name}
                </p>

                {notifications &&
                  notifications.total > 0 && (
                    <p className="text-sm text-red-600 font-semibold mb-3">
                      {notifications.total} alerte
                      {notifications.total > 1 ? "s" : ""}
                    </p>
                  )}

                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded w-full"
                >
                  Déconnexion
                </button>
              </div>
            </>
          )}

          {!user && (
            <>
              <Link
                href="/login"
                onClick={closeMenu}
                className="block py-2 hover:text-blue-600"
              >
                Connexion
              </Link>

              <Link
                href="/register"
                onClick={closeMenu}
                className="block bg-black text-white px-4 py-2 rounded text-center"
              >
                Inscription
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}