"use client";

import {
  useEffect,
  useState
} from "react";

import Link from "next/link";

import AppNavbar from "@/app/components/AppNavbar";

import { apiFetch } from "@/lib/api";

type Conversation = {
  id: number;
  job_id: number;
  job_title?: string;
  last_message?: string;
  last_message_at?: string;
};

export default function ConversationsPage() {

  const [conversations,
    setConversations] =
    useState<Conversation[]>([]);

  const [loading,
    setLoading] =
    useState(true);

  useEffect(() => {

    async function loadData() {

      try {

        const data =
          await apiFetch(
            "/conversations/me"
          );

        setConversations(data);

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

      <div className="p-10">

        <h1 className="text-4xl font-bold mb-8">
          Conversations
        </h1>

        <div className="space-y-4">

          {conversations.length === 0 && (

            <div className="border rounded-2xl p-8 bg-white text-center">

              <h2 className="text-2xl font-bold mb-3">
                Aucune conversation
              </h2>

              <p className="text-gray-600">
                Les conversations apparaîtront ici
                lorsque vous postulerez ou accepterez un besoin.
              </p>

            </div>

          )}

          {conversations.map(
            (conversation) => (

              <Link
                key={conversation.id}

                href={`/conversations/${conversation.id}`}

                className="block border rounded-lg p-5 hover:bg-gray-50 bg-white transition"
              >

                <div className="flex items-center justify-between gap-4">

                  <div>

                    <h2 className="text-xl font-bold">
                      {conversation.job_title}
                    </h2>

                    <p className="text-gray-600 mt-1">

                      {conversation.last_message
                        ? conversation.last_message
                        : "Aucun message pour le moment."}

                    </p>

                  </div>

                  <div className="text-sm text-gray-500 whitespace-nowrap">

                    {conversation.last_message_at &&
                      new Date(
                        conversation.last_message_at
                      ).toLocaleTimeString()}

                  </div>

                </div>

              </Link>

            )
          )}

        </div>

      </div>
    </>
  );
}