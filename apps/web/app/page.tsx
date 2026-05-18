"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import AppNavbar from "@/app/components/AppNavbar";

import { apiFetch } from "@/lib/api";

type User = {
  id: number;

  role: string;

  can_work?: boolean;

  can_hire?: boolean;
};

const examples = [
  "Besoin d’un lift vers Rouyn ce soir",
  "Aide pour déménager un sofa",
  "Gardiennage dimanche après-midi",
  "Ménage rapide avant une visite",
  "Transport d’un meuble depuis North Bay",
  "Aide pour bois de chauffage",
];

export default function HomePage() {

  const [user, setUser] =
    useState<User | null>(null);

  useEffect(() => {

    async function loadUser() {

      try {

        const data =
          await apiFetch("/users/me");

        setUser(data);

      } catch {

        setUser(null);
      }
    }

    loadUser();

  }, []);

  const dashboardHref =
    user?.can_work
      ? "/worker/dashboard"
      : "/client/dashboard";

  return (
    <>
      <AppNavbar />

      <main className="min-h-[calc(100vh-73px)] bg-gradient-to-b from-white to-blue-50">

        <section className="px-6 py-20 md:py-24 text-center max-w-5xl mx-auto">

          <div className="inline-flex items-center rounded-full border bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm mb-8">
            Bêta locale — disponible au Témiscaming
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">

            Besoin d’aide rapidement ?
            <br />

            <span className="text-blue-600">
              Trouvez quelqu’un près de chez vous au Témiscaming.
            </span>

          </h1>

          <p className="mt-8 text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">

            MainForte met en relation les personnes du Témiscaming
            qui ont un besoin ponctuel avec des travailleurs disponibles localement.

            <br />
            <br />

            Déménagement, ménage, transport, gardiennage,
            petits travaux, aide urgente ou service de dernière minute.

          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">

            {!user && (
              <>
                <Link
                  href="/register"
                  className="bg-black text-white px-8 py-4 rounded-xl text-lg font-semibold hover:opacity-90 transition"
                >
                  Publier ou trouver du travail
                </Link>

                <Link
                  href="/login"
                  className="border bg-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition"
                >
                  Connexion
                </Link>
              </>
            )}

            {user && (
              <Link
                href={dashboardHref}
                className="bg-black text-white px-8 py-4 rounded-xl text-lg font-semibold hover:opacity-90 transition"
              >
                Aller au tableau de bord
              </Link>
            )}

          </div>

          <p className="mt-6 text-sm text-gray-500">
            MainForte facilite la mise en relation.
            Les arrangements se font directement entre les utilisateurs.
          </p>

        </section>

        <section className="px-6 pb-12">

          <div className="max-w-6xl mx-auto">

            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Exemples de besoins que vous pouvez publier
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">

              {examples.map((example) => (

                <div
                  key={example}
                  className="bg-white border rounded-2xl p-5 shadow-sm"
                >

                  <p className="font-semibold">
                    {example}
                  </p>

                </div>

              ))}

            </div>

          </div>

        </section>

        <section className="px-6 py-16">

          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">

            <div className="bg-white border rounded-2xl p-8 shadow-sm">

              <h2 className="text-2xl font-bold mb-4">
                1. Publiez un besoin
              </h2>

              <p className="text-gray-600 leading-relaxed">
                Décrivez ce que vous cherchez,
                la ville, le moment souhaité
                et le budget proposé.
              </p>

            </div>

            <div className="bg-white border rounded-2xl p-8 shadow-sm">

              <h2 className="text-2xl font-bold mb-4">
                2. Recevez des réponses
              </h2>

              <p className="text-gray-600 leading-relaxed">
                Les travailleurs disponibles peuvent postuler
                ou vous écrire directement selon le besoin.
              </p>

            </div>

            <div className="bg-white border rounded-2xl p-8 shadow-sm">

              <h2 className="text-2xl font-bold mb-4">
                3. Entendez-vous entre vous
              </h2>

              <p className="text-gray-600 leading-relaxed">
                Discutez dans la messagerie,
                confirmez les détails et organisez
                le service directement.
              </p>

            </div>

          </div>

        </section>

        <section className="px-6 py-16">

          <div className="max-w-6xl mx-auto">

            <div className="text-center mb-10">

              <h2 className="text-3xl md:text-4xl font-black">
                Explorer la communauté MainForte
              </h2>

              <p className="mt-4 text-gray-600 text-lg">
                Découvrez des travailleurs disponibles
                et des clients actifs au Témiscaming.
              </p>

            </div>

            <div className="grid md:grid-cols-2 gap-6">

              <Link
                href="/workers"
                className="bg-white border rounded-3xl p-8 shadow-sm hover:shadow-md transition"
              >

                <h3 className="text-2xl font-bold mb-3">
                  Travailleurs disponibles
                </h3>

                <p className="text-gray-600 leading-relaxed">
                  Explorez les profils,
                  les compétences,
                  les avis et les disponibilités
                  des travailleurs locaux.
                </p>

                <div className="mt-6 text-blue-600 font-semibold">
                  Voir les travailleurs →
                </div>

              </Link>

              <Link
                href="/clients"
                className="bg-white border rounded-3xl p-8 shadow-sm hover:shadow-md transition"
              >

                <h3 className="text-2xl font-bold mb-3">
                  Clients et besoins locaux
                </h3>

                <p className="text-gray-600 leading-relaxed">
                  Découvrez les personnes qui utilisent
                  MainForte partout au Témiscaming
                  pour trouver de l’aide locale.
                </p>

                <div className="mt-6 text-blue-600 font-semibold">
                  Voir les clients →
                </div>

              </Link>

            </div>

          </div>

        </section>

        <section className="px-6 pb-16">

          <div className="max-w-5xl mx-auto bg-blue-600 text-white rounded-3xl p-8 md:p-12">

            <h2 className="text-3xl font-black mb-4">
              Disponible actuellement au Témiscaming
            </h2>

            <p className="text-lg text-blue-100 leading-relaxed">
              MainForte commence localement avec :
              Ville-Marie, Témiscaming, Notre-Dame-du-Nord,
              Lorrainville, Béarn, Duhamel-Ouest
              et les municipalités voisines.
            </p>

          </div>

        </section>

        <section className="px-6 pb-24">

          <div className="max-w-4xl mx-auto bg-black text-white rounded-3xl p-8 md:p-12 text-center">

            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Une plateforme locale, simple et humaine.
            </h2>

            <p className="text-gray-300 text-lg leading-relaxed">
              MainForte est pensé pour les besoins réels du quotidien :
              trouver rapidement quelqu’un de disponible au Témiscaming.
            </p>

          </div>

        </section>

      </main>
    </>
  );
}