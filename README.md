# Budgex Tracker

A personal mobile budget and expense tracker project built with Expo React Native, TypeScript, and NativeWind, focused on simple expense logging and budget monitoring.

## Current Starter Features

- Bottom-tab navigation with separate Home and Records pages
- General tab with hamburger-menu style access for account and app settings
- Homepage for consolidated summaries, sync status, and overall ledger records
- Daily Records page for passbook-style ledger entries by date
- Balance, income, and expense summary cards
- Budget overview by category
- Passbook-style ledger records with withdrawal, deposit, balance, and remarks
- Offline-first transaction storage using AsyncStorage
- NativeWind and Tailwind CSS utility-based styling
- Supabase-ready sync layer for pending local transactions
- Local account profile and settings storage ready for multi-user expansion
- Supabase email auth and Google OAuth code paths are wired into the General tab

## Tech Stack

- Expo
- React Native
- TypeScript
- NativeWind
- Tailwind CSS
- AsyncStorage
- Supabase

## Run The App

1. Install dependencies:

```bash
npm install
```

2. Start the Expo development server:

```bash
npm start
```

3. Open the app in:

- Expo Go on Android
- iOS Simulator or Expo Go on iPhone
- Web browser with `npm run web`

## Recommended Next Steps

- Add filters by month and category
- Create charts for monthly spending
- Add budgets that warn when spending goes over the limit
- Configure Supabase credentials, auth providers, and database tables

## Offline And Online Storage Plan

- Transactions are saved locally on the phone first
- Local storage is pruned to roughly the latest 30 days of transactions
- The Records page defaults to today and resets to that day when the app becomes active again
- Daily totals stay scoped to the currently selected date on the Records page
- New items are marked as `pending` until they are synced online
- Manual sync is already wired into the app
- Supabase can be enabled later by filling in [src/config/supabase.ts](J:\GITHUB\budgex-tracker\src\config\supabase.ts)

## Account And Settings

- The `General` tab is the app’s menu/settings area
- Email login, registration, and Google sign-in buttons are now wired to Supabase auth code paths
- App sync settings are currently stored locally per device
- Sign out is available from the current account section

## Environment Variables

Create a local `.env` file using [.env.example](J:\GITHUB\budgex-tracker\.env.example):

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Supabase Notes

The app now reads Supabase auth credentials from environment variables through [src/config/supabase.ts](J:\GITHUB\budgex-tracker\src\config\supabase.ts).

Before testing auth, configure:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Google provider in Supabase Auth
- redirect URI for the custom app scheme `budgex://auth/callback`
- the `profiles` and `transactions` tables

Relevant auth and client files:

- [src/lib/supabase-client.ts](J:\GITHUB\budgex-tracker\src\lib\supabase-client.ts)
- [src/lib/auth.ts](J:\GITHUB\budgex-tracker\src\lib\auth.ts)
- [src/config/supabase.ts](J:\GITHUB\budgex-tracker\src\config\supabase.ts)

Suggested `profiles` table columns:

```sql
id uuid primary key,
email text unique not null,
display_name text,
provider text,
created_at timestamptz default now(),
updated_at timestamptz default now()
```

Suggested table columns:

```sql
id text primary key,
description text not null,
category text not null,
amount numeric not null,
transaction_date timestamptz not null,
transaction_type text not null,
created_at timestamptz not null,
updated_at timestamptz not null,
sync_status text,
last_synced_at timestamptz,
remote_id text,
remarks text
```

## Project Goal

This project is meant to stay simple and practical while you get back into coding. The current version gives you a clean starting point that we can grow feature by feature.
