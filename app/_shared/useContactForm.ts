"use client";

import { useState } from "react";

export type ContactStatus = "idle" | "submitting" | "success" | "error";

/**
 * Contact form state and submission against POST /api/contact.
 * Markup and styling belong to each world; this owns only behaviour.
 */
export function useContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<ContactStatus>("idle");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 201) {
        setStatus("success");
        setName(""); setEmail(""); setMessage("");
        return;
      }
      if (res.status === 400) {
        setError(data?.errors?.[0]?.msg || data?.message || "Check the fields and try again.");
      } else if (res.status === 429) {
        setError("Too many messages from this connection. Try again in 15 minutes, or email me directly.");
      } else {
        setError("The message didn't send. Try again, or email me directly.");
      }
      setStatus("error");
    } catch {
      setError("No connection. Check your network and try again.");
      setStatus("error");
    }
  };

  const reset = () => setStatus("idle");

  return { name, setName, email, setEmail, message, setMessage, status, error, submit, reset };
}
