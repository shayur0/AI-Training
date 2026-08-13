-- Illumination Space — Smart Worksheet Generator
-- Schema from the final ERD (M10 database assessment)
-- Target: Postgres (Supabase)
--
-- Run in Supabase: Dashboard -> SQL Editor -> paste this file -> Run.

create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null check (role in ('child', 'parent', 'teacher')),
  age_band text,
  created_at timestamptz not null default now()
);

create table if not exists worksheets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  topic text not null,
  subject text not null,
  created_at timestamptz not null default now()
);

create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  worksheet_id uuid not null references worksheets(id) on delete cascade,
  prompt text not null,
  type text not null check (type in ('numeric', 'multiple_choice')),
  answer_key text not null,
  skill text,
  explanation text,
  created_at timestamptz not null default now()
);

create table if not exists answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references questions(id) on delete cascade,
  submitted_value text not null,
  is_correct boolean not null,
  feedback text,
  created_at timestamptz not null default now()
);

create index if not exists idx_worksheets_user_id on worksheets(user_id);
create index if not exists idx_questions_worksheet_id on questions(worksheet_id);
create index if not exists idx_answers_question_id on answers(question_id);
