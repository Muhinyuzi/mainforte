"use client";

import {
  use,
  useEffect,
  useRef,
  useState
} from "react";

import AppNavbar from "@/app/components/AppNavbar";

import { apiFetch } from "@/lib/api";

type User = {
  id: number;
};

type Message = {
  id: number;
  sender_id: number;
  sender_name: string;
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

  const messagesEndRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const [currentUser,
    setCurrentUser] =
    useState<User | null>(null);

  const [messages,
    setMessages] =
    useState<Message[]>([]);

  const [content,
    setContent] =
    useState("");

  const [loading,
    setLoading] =
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

  async function loadCurrentUser() {

    try {

      const me =
        await apiFetch(
          "/users/me"
        );

      setCurrentUser(me);

    } catch (error) {

      console.error(error);
    }
  }

  useEffect(() => {

    loadCurrentUser();

    loadMessages();

    const interval =
      setInterval(() => {

        loadMessages();

      }, 3000);

    return () =>
      clearInterval(interval);

  }, []);

  useEffect(() => {

    messagesEndRef.current
      ?.scrollIntoView({
        behavior: "smooth",
      });

  }, [messages]);

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
          Chargement...
        </div>
      </>
    );
  }

  return (
    <>
      <AppNavbar />

      <main className="h-[calc(100vh-73px)] bg-gray-50 flex flex-col">

        <div className="border-b bg-white px-6 py-4">

          <h1 className="text-2xl md:text-3xl font-bold">
            Conversation
          </h1>

        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-4">

          {messages.length === 0 && (

            <div className="text-center text-gray-500 mt-10">

              Aucun message pour le moment.

            </div>

          )}

          {messages.map((message, index) => {

            const isMine =
              message.sender_id ===
              currentUser?.id;

            return (

              <div
                key={`message-${message.id}-${index}`}

                className={`flex ${
                  isMine
                    ? "justify-end"
                    : "justify-start"
                }`}
              >

                <div
                  className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 shadow ${
                    isMine
                      ? "bg-black text-white"
                      : "bg-white"
                  }`}
                >

                  {!isMine && (

                    <p className="text-xs font-semibold mb-1 opacity-70">

                      {message.sender_name}

                    </p>

                  )}

                  <p className="whitespace-pre-wrap break-words">

                    {message.content}

                  </p>

                  <p className="text-xs mt-2 opacity-70">

                    {message.created_at &&
                    !isNaN(
                      new Date(
                        message.created_at
                      ).getTime()
                    )
                      ? new Date(
                          message.created_at
                        ).toLocaleTimeString()
                      : ""}

                  </p>

                </div>

              </div>

            );
          })}

          <div ref={messagesEndRef} />

        </div>

        <div className="border-t bg-white p-3 md:p-4 flex gap-2 md:gap-3">

          <input
            type="text"

            value={content}

            onChange={(e) =>
              setContent(
                e.target.value
              )
            }

            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSend();
              }
            }}

            placeholder="Écrire un message..."

            className="flex-1 border rounded-full px-4 md:px-5 py-3 focus:outline-none"
          />

          <button
            onClick={handleSend}

            disabled={!content.trim()}

            className={`px-4 md:px-6 rounded-full text-white transition ${
              content.trim()
                ? "bg-black"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Envoyer
          </button>

        </div>

      </main>
    </>
  );
}