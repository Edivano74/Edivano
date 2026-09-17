create extension if not exists pgcrypto;

create table if not exists public.trip_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  stripe_session_id text unique,
  request_json jsonb not null,
  preview_json jsonb,
  full_plan_json jsonb
);

alter table public.trip_requests enable row level security;

-- Kein Client-Zugriff im MVP. Zugriff erfolgt serverseitig über den Service-Role-Key.
