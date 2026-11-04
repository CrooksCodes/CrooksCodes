---
title: "How this site's contact form works"
date: "2026-10-10"
summary: "A Next.js route handler, a Supabase table, and Resend for email, and why I collapsed a separate Express backend into the same deployment."
tags: ["Technical", "Next.js", "Supabase", "TypeScript"]
---

This site used to be two deployments: a static front end on Netlify and a small Express API somewhere else that handled the contact form. It worked, but it meant two things to deploy, a CORS config to maintain, and two places for secrets to live.

Next.js route handlers let me fold the API into the same app. Here's what the form does now, start to finish.

## The pipeline

A `POST` to `/api/contact` runs four steps:

1. **Rate limit** the client IP.
2. **Validate** name, email and message.
3. **Insert** the row into a Supabase `contacts` table.
4. **Email me** via Resend, fire and forget.

The ordering matters. The database write is the thing that must succeed. The email is a convenience, so a failure there logs an error and the request still returns `201`.

```ts
// 4. Notify (fire-and-forget)
sendContactNotification(newContact).catch((err) => {
  console.error("CONTACT EMAIL DISPATCH ERROR:", err);
});

return NextResponse.json({ success: true, data: newContact }, { status: 201 });
```

## Rate limiting without Redis

The limiter is an in-memory `Map` keyed by IP: five requests per rolling fifteen-minute window. On Vercel that state lives inside one warm serverless instance, so it resets on a cold start and isn't shared between instances.

For a portfolio contact form that's fine: it stops someone hammering the submit button, and that's the actual threat. If I ever needed a hard guarantee I'd swap it for an Upstash-backed limiter, and the function signature is already shaped so that's a one-file change.

## Keeping secrets server-side

The Supabase client uses the **service-role key**, which bypasses row-level security. That key can never reach the browser, so the module that creates the client is only ever imported from route handlers, and the env var deliberately has no `NEXT_PUBLIC_` prefix.

The client is also created lazily:

```ts
export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Supabase is not configured: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }
  cached = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  return cached;
}
```

A missing env var now fails *at request time* with a clear message instead of crashing `next build`. That caught me once on a preview deploy that didn't have the secrets set, and the error told me exactly what was wrong.

## What I'd do differently

- **Validation** is hand-rolled. It's twenty lines and it works, but a schema library like Zod would give me the types for free.
- **Escaping** the user's message before it goes into the notification email was something I almost forgot. User input in an HTML email is still user input in HTML.

The whole thing is about 150 lines across three files. The win wasn't the code. It was deleting a deployment.
