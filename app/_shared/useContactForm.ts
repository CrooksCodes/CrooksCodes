"use client";

import { useState } from "react";

export type ContactStatus = "idle" | "submitting" | "success" | "error";

export type FieldErrors = { name?: string; email?: string; message?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(name: string, email: string, message: string): FieldErrors {
  const found: FieldErrors = {};
  if (name.trim().length < 2) found.name = "Add your name, at least 2 characters.";
  if (!EMAIL_RE.test(email.trim())) found.email = "Add an email I can reply to, like you@company.com.";
  if (message.trim().length < 10) found.message = "Write at least 10 characters so I know what this is about.";
  return found;
}

/**
 * Contact form state and submission against POST /api/contact.
 * Markup and styling belong to each world; this owns only behaviour.
 */
export function useContactForm() {
  const [name, setNameValue] = useState("");
  const [email, setEmailValue] = useState("");
  const [message, setMessageValue] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitCount, setSubmitCount] = useState(0);
  const [status, setStatus] = useState<ContactStatus>("idle");
  const [error, setError] = useState("");

  const clear = (field: keyof FieldErrors) => setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  const setName = (v: string) => { setNameValue(v); clear("name"); };
  const setEmail = (v: string) => { setEmailValue(v); clear("email"); };
  const setMessage = (v: string) => { setMessageValue(v); clear("message"); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting") return;
    setSubmitCount((n) => n + 1);
    // same rules as /api/contact, so a typo never spends a rate-limited request
    const found = validate(name, email, message);
    setFieldErrors(found);
    if (Object.keys(found).length > 0) {
      setError("");
      setStatus("error");
      return;
    }
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
        setNameValue(""); setEmailValue(""); setMessageValue("");
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

  return { name, setName, email, setEmail, message, setMessage, status, error, fieldErrors, submitCount, submit, reset };
}
