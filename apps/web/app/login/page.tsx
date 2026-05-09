"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { saveToken } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  async function handleLogin(
    e: React.FormEvent
  ) {
    e.preventDefault();

    const formData =
      new URLSearchParams();

    formData.append(
      "username",
      email
    );

    formData.append(
      "password",
      password
    );

    const response = await fetch(
      "http://localhost:8000/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
        body: formData,
      }
    );

    if (!response.ok) {
      alert("Login failed");
      return;
    }

    const data =
      await response.json();

    saveToken(data.access_token);

    // get current user
    const meResponse =
      await fetch(
        "http://localhost:8000/users/me",
        {
          headers: {
            Authorization: `Bearer ${data.access_token}`,
          },
        }
      );

    if (!meResponse.ok) {
      alert(
        "Unable to load user profile"
      );
      return;
    }

    const me =
      await meResponse.json();

    // redirect by role
    if (me.role === "worker") {
      router.push(
        "/worker/dashboard"
      );
    } else if (
      me.role === "client"
    ) {
      router.push(
        "/client/dashboard"
      );
    } else {
      router.push("/");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleLogin}
        className="border p-8 rounded-lg w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-bold">
          Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
          value={email}
          onChange={(e) =>
            setEmail(
              e.target.value
            )
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 rounded"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
        />

        <button
          type="submit"
          className="w-full bg-black text-white p-2 rounded"
        >
          Login
        </button>
      </form>
    </div>
  );
}