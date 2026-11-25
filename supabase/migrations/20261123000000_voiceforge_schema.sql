-- ==========================================================
-- VOICEFORGE DATABASE SCHEMA & ROW LEVEL SECURITY MIGRATION
-- ==========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  default_language text default 'en',
  default_voice_id text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 2. PROJECTS TABLE
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  project_type text not null check (project_type in ('tts', 'translation', 'multi')),
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 3. AUDIO FILES TABLE
create table if not exists public.audio_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint,
  duration_seconds numeric(8,2) default 0.0,
  format text,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 4. GENERATIONS TABLE (Text-to-speech & Completed Audio generations)
create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  generation_type text not null check (generation_type in ('tts', 'translation')),
  input_text text,
  input_language text,
  output_language text,
  voice_id text not null,
  voice_name text,
  voice_settings jsonb default '{}'::jsonb,
  audio_file_id uuid references public.audio_files(id) on delete set null,
  audio_url text,
  duration_seconds numeric(8,2) default 0.0,
  characters_count integer default 0,
  status text not null check (status in ('pending', 'processing', 'completed', 'failed')) default 'completed',
  error_message text,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 5. TRANSLATIONS TABLE (Speech Translation Projects)
create table if not exists public.translations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  source_audio_file_id uuid references public.audio_files(id) on delete set null,
  source_audio_url text,
  detected_language text,
  source_transcript text,
  target_language text not null,
  translated_transcript text,
  final_speech_generation_id uuid references public.generations(id) on delete set null,
  status text not null check (status in ('uploaded', 'transcribing', 'transcribed', 'translating', 'translated', 'generating_speech', 'completed', 'failed')) default 'uploaded',
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 6. USER PREFERENCES TABLE
create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  default_voice_id text,
  default_language text default 'en',
  speed numeric(3,2) default 1.0,
  stability numeric(3,2) default 0.5,
  similarity numeric(3,2) default 0.75,
  favorite_voices text[] default '{}'::text[],
  theme text default 'lattice',
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 7. USAGE RECORDS TABLE
create table if not exists public.usage_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  operation_type text not null check (operation_type in ('tts_chars', 'transcription_seconds', 'translation_chars', 'tts_generation')),
  quantity numeric(10,2) not null,
  provider text not null,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- ==========================================================
-- INDEXES FOR FAST QUERYING
-- ==========================================================
create index if not exists idx_projects_user_id on public.projects(user_id);
create index if not exists idx_generations_user_id on public.generations(user_id);
create index if not exists idx_generations_project_id on public.generations(project_id);
create index if not exists idx_translations_user_id on public.translations(user_id);
create index if not exists idx_audio_files_user_id on public.audio_files(user_id);
create index if not exists idx_usage_records_user_id on public.usage_records(user_id);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.audio_files enable row level security;
alter table public.generations enable row level security;
alter table public.translations enable row level security;
alter table public.user_preferences enable row level security;
alter table public.usage_records enable row level security;

-- Profiles: users can select and update their own profile
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Projects: users can CRUD their own projects
create policy "Users can manage own projects"
  on public.projects for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Audio Files: users can CRUD their own audio files
create policy "Users can manage own audio files"
  on public.audio_files for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Generations: users can CRUD their own generations
create policy "Users can manage own generations"
  on public.generations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Translations: users can CRUD their own translations
create policy "Users can manage own translations"
  on public.translations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- User Preferences: users can read and write own preferences
create policy "Users can manage own preferences"
  on public.user_preferences for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Usage Records: users can read own usage records
create policy "Users can view own usage records"
  on public.usage_records for select
  using (auth.uid() = user_id);

create policy "Service role can insert usage records"
  on public.usage_records for insert
  with check (true);

-- ==========================================================
-- AUTOMATIC PROFILE & PREFERENCE CREATION TRIGGER
-- ==========================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', null)
  )
  on conflict (id) do nothing;

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution on auth.users insert
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==========================================================
-- STORAGE BUCKETS (Run in SQL Editor if bucket doesn't exist)
-- ==========================================================
-- insert into storage.buckets (id, name, public)
-- values ('audio-files', 'audio-files', true)
-- on conflict (id) do nothing;

-- create policy "Authenticated users can upload audio"
-- on storage.objects for insert
-- to authenticated
-- with check (bucket_id = 'audio-files' and auth.uid()::text = (storage.foldername(name))[1]);

-- create policy "Users can read own audio or public generated"
-- on storage.objects for select
-- to authenticated
-- using (bucket_id = 'audio-files');

