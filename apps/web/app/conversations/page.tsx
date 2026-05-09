"use client";

import { useEffect, useState } from "react";
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
  const [conversations, setConversations] =
    useState<Conversation[]>([]);

  const [loading, setLoading] =
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
          Conversations
        </h1>

        <div className="space-y-4">
          {conversations.length === 0 && (
            <p className="text-gray-600">
              No conversations yet.
            </p>
          )}

          {conversations.map(
            (conversation) => (
              <Link
                key={conversation.id}
                href={`/conversations/${conversation.id}`}
                className="block border rounded-lg p-5 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">
                      {
                        conversation.job_title
                      }
                    </h2>

                    <p className="text-gray-600 mt-1">
                      {
                        conversation.last_message
                      }
                    </p>
                  </div>

                  <div className="text-sm text-gray-500">
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