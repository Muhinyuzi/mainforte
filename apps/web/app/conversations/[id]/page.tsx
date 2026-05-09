"use client";

import {
  use,
  useEffect,
  useState
} from "react";

import AppNavbar from "@/app/components/AppNavbar";

import { apiFetch } from "@/lib/api";

type Message = {
  id: number;
  sender_id: number;
  content: string;
  created_at: string;
};

export default function ConversationPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {

  const resolvedParams =
    use(params);

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [content, setContent] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  async function loadMessages() {

    try {

      const data =
        await apiFetch(
          `/conversations/${resolvedParams.id}/messages`
        );

      setMessages(data);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);
    }
  }

  useEffect(() => {

    loadMessages();

    const interval =
      setInterval(() => {
        loadMessages();
      }, 3000);

    return () =>
      clearInterval(interval);

  }, []);

  async function handleSend() {

    if (!content.trim()) {
      return;
    }

    try {

      await apiFetch(
        `/conversations/${resolvedParams.id}/messages`,
        {
          method: "POST",

          body: JSON.stringify({
            content,
          }),
        }
      );

      setContent("");

      loadMessages();

    } catch (error) {

      console.error(error);
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

      <div className="p-10 h-[calc(100vh-73px)] flex flex-col">

        <h1 className="text-3xl font-bold mb-6">
          Conversation
        </h1>

        <div className="flex-1 border rounded-lg p-4 overflow-y-auto space-y-3 bg-white">

          {messages.map((message) => {

            const isMine =
              message.sender_id === 1;

            return (

              <div
                key={message.id}

                className={`flex ${
                  isMine
                    ? "justify-end"
                    : "justify-start"
                }`}
              >

                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 shadow ${
                    isMine
                      ? "bg-black text-white"
                      : "bg-gray-200 text-black"
                  }`}
                >

                  <p className="text-sm font-semibold mb-1">

                    {isMine
                      ? "Me"
                      : `User ${message.sender_id}`}

                  </p>

                  <p>
                    {message.content}
                  </p>

                  <p
                    className={`text-xs mt-2 ${
                      isMine
                        ? "text-gray-300"
                        : "text-gray-500"
                    }`}
                  >

                    {new Date(
                      message.created_at
                    ).toLocaleTimeString()}

                  </p>

                </div>

              </div>
            );
          })}

        </div>

        <div className="mt-4 flex gap-3">

          <input
            type="text"

            value={content}

            onChange={(e) =>
              setContent(
                e.target.value
              )
            }

            placeholder="Write message..."

            className="flex-1 border rounded px-4 py-3"
          />

          <button
            onClick={handleSend}
            className="bg-black text-white px-6 rounded"
          >
            Send
          </button>

        </div>

      </div>
    </>
  );
}