# Supabase Setup Guide

This guide explains how to set up a Supabase project and obtain the necessary credentials for Listly.

## 1. Create a Supabase Project

1.  Go to [supabase.com](https://supabase.com) and sign in/sign up.
2.  Click **"New Project"**.
3.  Choose your organization.
4.  Enter a **Name** (e.g., `listly-dev`) and **Database Password**.
5.  Select a **Region** close to you.
6.  Click **"Create new project"**.

## 2. Get API Credentials

Once your project is ready (this may take a minute):

1.  Go to **Project Settings** (gear icon at the bottom of the sidebar) or **Integrations**.
2.  On the left-side bar, look for **Data API** -> **API URL**.
3.  Copy this value. (e.g. `https://your-project.supabase.co`)

## 3. Get Project API Keys

1.  Go to **Project Settings** (gear icon) -> **API Keys** (sidebar).
2.  **Publishable key**: This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`. It starts with `sb_publishable_...`.
3.  **Secret keys**: Click to reveal. This is your `SUPABASE_SERVICE_ROLE_KEY`. It starts with `sb_secret_...`.

> **⚠️ WARNING**: Never expose your `service_role` key on the client side (i.e., do not prefix it with `NEXT_PUBLIC_`).

## 4. Configure Environment Variables

Update your `.env` file with the following values:

- **`NEXT_PUBLIC_SUPABASE_URL`**: Copy the value from **Project URL** (Configuration -> Data API).
- **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**: Copy the value from **Publishable key**.
- **`SUPABASE_SERVICE_ROLE_KEY`**: Copy the value from **Secret keys**.

## 5. Database Setup

To ensure connectivity (especially if your network is IPv4-only), use the Connection Pooler.

1.  Click the **"Connect"** button at the very top of the Supabase dashboard.
2.  Select **"ORMs"** -> **"Prisma"**.
3.  Change the **Mode** dropdown from "Transaction" to **"Session"**.
4.  Copy the **URI**. It should look like `postgresql://...:6543/postgres?pgbouncer=true`.
5.  Update `DATABASE_URL` in your `.env` file.
  - Replace `[YOUR-PASSWORD]` with the password you set in Step 1.
  - **Important**: Append `?pgbouncer=true` to the end of the URL if it's not already there., or use the Direct connection string for migrations.

## 6. Enable Realtime

1.  In the Supabase Dashboard, look at the **Left Sidebar**.
2.  Under the **Database** section, click **Publications**.
3.  You should see a publication named `supabase_realtime`.
4.  Click on it (or the arrow/edit button).
5.  Select the `list_items` table to enable it.
  > A pop-up will appear notifying you that the replication will be enabled.
