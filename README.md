# Budgex Tracker

A personal mobile budget and expense tracker project built with Expo React Native, TypeScript, and NativeWind, focused on simple expense logging and budget monitoring.

## Current Starter Features

- Dashboard-style home screen
- Add transaction form for income and expenses
- Balance, income, and expense summary cards
- Budget overview by category
- Recent transactions list with local sync status
- Offline-first transaction storage using AsyncStorage
- NativeWind and Tailwind CSS utility-based styling
- Supabase-ready sync layer for pending local transactions

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
- Configure Supabase credentials and create the transactions table

## Offline And Online Storage Plan

- Transactions are saved locally on the phone first
- Local storage is pruned to roughly the latest 30 days of transactions
- New items are marked as `pending` until they are synced online
- Manual sync is already wired into the app
- Supabase can be enabled later by filling in [src/config/supabase.ts](J:\GITHUB\budgex-tracker\src\config\supabase.ts)

## Supabase Notes

Update [src/config/supabase.ts](J:\GITHUB\budgex-tracker\src\config\supabase.ts) with your:

- Supabase project URL
- Supabase anon key
- table name if you do not want to use `transactions`

Suggested table columns:

```sql
id text primary key,
title text not null,
category text not null,
amount numeric not null,
transaction_date timestamptz not null,
transaction_type text not null,
created_at timestamptz not null,
updated_at timestamptz not null,
sync_status text,
last_synced_at timestamptz,
remote_id text
```

## Project Goal

This project is meant to stay simple and practical while you get back into coding. The current version gives you a clean starting point that we can grow feature by feature.
