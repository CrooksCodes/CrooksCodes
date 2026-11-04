---
title: "Keeping a free Supabase project awake with a Vercel cron"
date: "2026-10-10"
summary: "Free-tier Supabase projects pause after a week of inactivity, which silently breaks a low-traffic contact form. One cron job and twenty lines fixed it."
tags: ["Technical", "Supabase", "Vercel", "Bug"]
---

The contact form on this site stopped working and I didn't notice for days. No error on the page, no deploy failure. The form just returned a database error.

The cause: Supabase pauses free-tier projects after roughly seven days with no activity. A portfolio site doesn't get seven contact submissions a week, so the project went to sleep and the only fix was clicking "Restore" in the dashboard.

## The fix

Ping the database once a day. Vercel has built-in cron, so it's a route handler plus one line of config.

```json
// vercel.json
{
  "crons": [
    { "path": "/api/cron/keep-alive", "schedule": "0 12 * * *" }
  ]
}
```

The handler runs the smallest real query I could think of:

```ts
const { data, error } = await supabase
  .from("contacts")
  .select("id")
  .limit(1);
```

## Two things that bit me

**Don't use a HEAD count.** My first version was `select("*", { count: "exact", head: true })`, which seemed cleverer because it returns no rows. Under the Next.js fetch runtime that HEAD request came back as an empty `{ message: "" }` error. Selecting one id column from one row is boring and works.

**Protect the endpoint.** Anyone who finds the URL can poke your database. Vercel sends an `Authorization: Bearer $CRON_SECRET` header when that env var is set on the project, so the handler checks it:

```ts
const secret = process.env.CRON_SECRET;
if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
  return new NextResponse("Unauthorized", { status: 401 });
}
```

Note the `secret &&`. I only reject when a secret is configured. Otherwise a preview deployment without the env var would quietly turn every ping into a 401 and I'd be back where I started, except now with a cron job that looks like it's working.

## Lesson

"It works" and "it keeps working" are different tests. The form passed the first one on launch day and failed the second one a week later. Now there's a daily heartbeat and a log line I can check.
