"use client";

import {
  useEffect,
  useRef,
  useState
} from "react";

import AppNavbar from "@/app/components/AppNavbar";

import { apiFetch } from "@/lib/api";

type User = {
  id: number;
  full_name: string;
};

type Conversation = {
  id: number;
  job_title?: string;
  last_message?: string;
};

type Message = {
  id: number;
  sender_id: number;
  content: string;
  created_at: string;
};

export default function MessagesPage() {
  const messagesEndRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const [currentUser,
    setCurrentUser] =
    useState<User | null>(null);

  const [conversations,
    setConversations] =
    useState<Conversation[]>([]);

  const [selectedConversation,
    setSelectedConversation] =
    useState<number | null>(null);

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [content, setContent] =
    useState("");

  async function loadCurrentUser() {
    try {
      const data =
        await apiFetch(
          "/users/me"
        );

      setCurrentUser(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function loadConversations() {
    try {
      const data =
        await apiFetch(
          "/conversations/me"
        );

      setConversations(data);

      if (
        data.length > 0 &&
        !selectedConversation
      ) {
        setSelectedConversation(
          data[0].id
        );
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function loadMessages(
    conversationId: number
  ) {
    try {
      const data =
        await apiFetch(
          `/conversations/${conversationId}/messages`
        );

      setMessages(data);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadCurrentUser();

    loadConversations();

    const interval =
      setInterval(() => {
        loadConversations();

        if (selectedConversation) {
          loadMessages(
            selectedConversation
          );
        }
      }, 3000);

    return () =>
      clearInterval(interval);
  }, [selectedConversation]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(
        selectedConversation
      );
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current
      ?.scrollIntoView({
        behavior: "smooth",
      });
  }, [messages]);

  async function handleSend() {
    if (
      !content.trim() ||
      !selectedConversation
    ) {
      return;
    }

    try {
      await apiFetch(
        `/conversations/${selectedConversation}/messages`,
        {
          method: "POST",
          body: JSON.stringify({
            content,
          }),
        }
      );

      setContent("");

      loadMessages(
        selectedConversation
      );
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <AppNavbar />

      <div className="h-[calc(100vh-73px)] flex flex-col md:flex-row">

        {/* SIDEBAR */}

        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r p-4 overflow-y-auto bg-white max-h-64 md:max-h-none">

          <h1 className="text-2xl font-bold mb-6">
            Messages
          </h1>

          <div className="space-y-3">
            {conversations.map(
              (conversation) => (
                <button
                  key={conversation.id}
                  onClick={() =>
                    setSelectedConversation(
                      conversation.id
                    )
                  }
                  className={`w-full text-left border rounded-lg p-4 hover:bg-gray-100 transition ${
                    selectedConversation ===
                    conversation.id
                      ? "bg-gray-100"
                      : ""
                  }`}
                >
                  <p className="font-bold">
                    {
                      conversation.job_title
                    }
                  </p>

                  <p className="text-sm text-gray-600 truncate">
                    {
                      conversation.last_message
                    }
                  </p>
                </button>
              )
            )}
          </div>
        </div>

        {/* CHAT */}

        <div className="flex-1 flex flex-col bg-gray-50 min-h-0">

          {!selectedConversation && (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a conversation
            </div>
          )}

          {selectedConversation && (
            <>
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">

                {messages.map((message) => {
                  const isMine =
                    message.sender_id ===
                    currentUser?.id;

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
                        className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 shadow ${
                          isMine
                            ? "bg-black text-white"
                            : "bg-white"
                        }`}
                      >
                        <p>
                          {message.content}
                        </p>

                        <p className="text-xs mt-2 opacity-70">
                          {new Date(
                            message.created_at
                          ).toLocaleTimeString()}
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
                  placeholder="Write message..."
                  className="flex-1 border rounded-full px-4 md:px-5 py-3 focus:outline-none"
                />

                <button
                  onClick={handleSend}
                  className="bg-black text-white px-4 md:px-6 rounded-full"
                >
                  Send
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}