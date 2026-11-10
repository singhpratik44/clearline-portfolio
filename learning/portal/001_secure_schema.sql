-- APERTURE Learning · private guardian/coach portfolio backend
-- Run manually in the SQL editor of a newly created, dedicated Supabase project.
-- Public GitHub Pages NEVER contains actual learners' records or service-role keys.
-- IMPORTANT: Apply and TEST RLS before enabling portal/config.js.
begin;
create extension if not exists pgcrypto;
create schema if not exists app_private;
revoke all on schema app_private from public, anon;
grant usage on schema app_private to authenticated;

create table if not exists public.ap_learner_profiles (
  id uuid primary key default gen_random_uuid(),
  guardian_id uuid not null references auth.users(id) on delete cascade,
  display_alias text not null check (char_length(trim(display_alias)) between 2 and 40),
  age_band text not null check(age_band in ('4-6','7-10','11-13','14-17')),
  created_at timestamptz not null default now()
);
create index if not exists ap_learner_guardian_idx on public.ap_learner_profiles (guardian_id);

create table if not exists public.ap_coach_assignments (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references public.ap_learner_profiles(id) on delete cascade,
  coach_id uuid not null references auth.users(id) on delete cascade,
  active boolean not null default false,
  consent_confirmed_at timestamptz not null,
  coach_verified_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique(learner_id,coach_id)
);
create index if not exists ap_assigned_coach_idx on public.ap_coach_assignments(coach_id,learner_id);

create table if not exists public.ap_projects (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references public.ap_learner_profiles(id) on delete cascade,
  track_id text not null check (track_id in (
    'scratch-stories','roblox-worlds','minecraft-makers','3d-game-design',
    'python-adventures','web-creators','mobile-prototypes','data-detectives',
    'ai-literacy','machine-learning','ai-agents','computer-vision',
    'robotics','electronics','cyber-citizenship','math-simulations',
    'sports-analytics','climate-tech','music-media-code','startup-builders'
  )),
  title text not null check (char_length(trim(title)) between 3 and 100),
  project_goal text not null default '' check(char_length(project_goal) <= 1200),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);
create index if not exists ap_projects_learner_idx on public.ap_projects(learner_id,created_at desc);

-- Evidence is append-only: changing a submission after verification would make
-- a coach's endorsement misleading. Corrections require a NEW submission.
create table if not exists public.ap_submissions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.ap_projects(id) on delete cascade,
  chapter integer not null check (chapter between 1 and 4),
  evidence_note text not null check (char_length(trim(evidence_note)) between 15 and 3000),
  artifact_path text unique check (artifact_path is null or char_length(artifact_path) between 20 and 300),
  submitted_by uuid not null references auth.users(id),
  submitted_at timestamptz not null default now()
);
create index if not exists ap_submissions_project_idx on public.ap_submissions(project_id,submitted_at desc);

-- Only an independently, explicitly assigned coach can verify work.
-- Guardian cannot write this table. Reviews are also immutable.
create table if not exists public.ap_coach_reviews (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.ap_submissions(id) on delete cascade,
  coach_id uuid not null references auth.users(id),
  verdict text not null check (verdict in ('verified','revise')),
  feedback text not null check (char_length(trim(feedback)) between 15 and 2000),
  reviewed_at timestamptz not null default now(),
  unique(submission_id,coach_id)
);
create index if not exists ap_review_submission_idx on public.ap_coach_reviews(submission_id);

-- Privacy rights have a controlled, auditable deletion-request path.
-- Operators must process the request in Supabase admin interface, including files.
create table if not exists public.ap_data_requests (
  id uuid primary key default gen_random_uuid(),
  guardian_id uuid not null references auth.users(id) on delete cascade,
  learner_id uuid references public.ap_learner_profiles(id) on delete set null,
  request_type text not null check(request_type in ('export','delete','correct')),
  request_note text not null default '' check(char_length(request_note) <= 500),
  created_at timestamptz not null default now()
);

-- Private, non-API-exposed authorization helpers. All SQL references are qualified.
create or replace function app_private.ap_is_guardian(p_learner uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists(
    select 1 from public.ap_learner_profiles l
    where l.id=p_learner and l.guardian_id = (select auth.uid())
  );
$$;
create or replace function app_private.ap_is_coach(p_learner uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.ap_coach_assignments a
    where a.learner_id=p_learner and a.coach_id=(select auth.uid())
      and a.active=true and a.coach_verified_at is not null and a.consent_confirmed_at is not null
  );
$$;
create or replace function app_private.ap_can_view_learner(p_learner uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select app_private.ap_is_guardian(p_learner) or app_private.ap_is_coach(p_learner);
$$;
create or replace function app_private.ap_project_learner(p_project uuid)
returns uuid language sql stable security definer set search_path = ''
as $$ select p.learner_id from public.ap_projects p where p.id=p_project limit 1 $$;
create or replace function app_private.ap_submission_learner(p_submission uuid)
returns uuid language sql stable security definer set search_path = ''
as $$
  select p.learner_id
  from public.ap_submissions s join public.ap_projects p on p.id=s.project_id
  where s.id=p_submission limit 1
$$;
create or replace function app_private.ap_can_view_project(p_project uuid)
returns boolean language sql stable security definer set search_path = ''
as $$ select coalesce(app_private.ap_can_view_learner(app_private.ap_project_learner(p_project)),false) $$;
create or replace function app_private.ap_can_view_submission(p_submission uuid)
returns boolean language sql stable security definer set search_path = ''
as $$ select coalesce(app_private.ap_can_view_learner(app_private.ap_submission_learner(p_submission)),false) $$;
-- Storage paths: guardian_uuid / learner_uuid / project_uuid / submission_uuid.extension
create or replace function app_private.ap_can_upload_file(p_path text)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists(
    select 1 from public.ap_projects p
      join public.ap_learner_profiles l on l.id=p.learner_id
    where l.guardian_id=(select auth.uid())
      and split_part(p_path,'/',1)=l.guardian_id::text
      and split_part(p_path,'/',2)=l.id::text
      and split_part(p_path,'/',3)=p.id::text
      and split_part(p_path,'/',4) ~ '^[0-9a-f-]{36}\.(pdf|txt|png)$'
      and split_part(p_path,'/',5)=''
  );
$$;
create or replace function app_private.ap_can_view_file(p_path text)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists(
    select 1 from public.ap_projects p
      join public.ap_learner_profiles l on l.id=p.learner_id
    where split_part(p_path,'/',1)=l.guardian_id::text
      and split_part(p_path,'/',2)=l.id::text
      and split_part(p_path,'/',3)=p.id::text
      and (
        l.guardian_id=(select auth.uid())
        or (app_private.ap_is_coach(l.id) and exists(
          select 1 from public.ap_submissions s where s.project_id=p.id and s.artifact_path=p_path
        ))
      )
  );
$$;

revoke all on function
  app_private.ap_is_guardian(uuid),app_private.ap_is_coach(uuid),
  app_private.ap_can_view_learner(uuid),app_private.ap_project_learner(uuid),
  app_private.ap_submission_learner(uuid),app_private.ap_can_view_project(uuid),
  app_private.ap_can_view_submission(uuid),app_private.ap_can_upload_file(text),
  app_private.ap_can_view_file(text)
from public,anon;
grant execute on function
  app_private.ap_is_guardian(uuid),app_private.ap_is_coach(uuid),
  app_private.ap_can_view_learner(uuid),app_private.ap_project_learner(uuid),
  app_private.ap_submission_learner(uuid),app_private.ap_can_view_project(uuid),
  app_private.ap_can_view_submission(uuid),app_private.ap_can_upload_file(text),
  app_private.ap_can_view_file(text)
to authenticated;

-- Least privilege: no public access, no client changes to authorization tables.
alter table public.ap_learner_profiles enable row level security;
alter table public.ap_coach_assignments enable row level security;
alter table public.ap_projects enable row level security;
alter table public.ap_submissions enable row level security;
alter table public.ap_coach_reviews enable row level security;
alter table public.ap_data_requests enable row level security;
revoke all on table
  public.ap_learner_profiles,public.ap_coach_assignments,
  public.ap_projects,public.ap_submissions,
  public.ap_coach_reviews,public.ap_data_requests
from public,anon,authenticated;
grant select,insert on public.ap_learner_profiles to authenticated;
grant select on public.ap_coach_assignments to authenticated;
grant select,insert on public.ap_projects to authenticated;
grant select,insert on public.ap_submissions to authenticated;
grant select,insert on public.ap_coach_reviews to authenticated;
grant select,insert on public.ap_data_requests to authenticated;

create policy ap_learner_select on public.ap_learner_profiles
  for select to authenticated using (app_private.ap_can_view_learner(id));
create policy ap_learner_insert on public.ap_learner_profiles
  for insert to authenticated with check (
    guardian_id=(select auth.uid())
  );
create policy ap_assignment_select on public.ap_coach_assignments
  for select to authenticated using (
    coach_id=(select auth.uid()) or app_private.ap_is_guardian(learner_id)
  );
create policy ap_project_select on public.ap_projects
  for select to authenticated using (app_private.ap_can_view_learner(learner_id));
create policy ap_project_insert on public.ap_projects
  for insert to authenticated with check (
    created_by=(select auth.uid()) and app_private.ap_is_guardian(learner_id)
  );
create policy ap_submission_select on public.ap_submissions
  for select to authenticated using (app_private.ap_can_view_project(project_id));
create policy ap_submission_insert on public.ap_submissions
  for insert to authenticated with check (
    submitted_by=(select auth.uid())
    and app_private.ap_is_guardian(app_private.ap_project_learner(project_id))
    and (artifact_path is null or (
      split_part(artifact_path,'/',3)=project_id::text
      and app_private.ap_can_upload_file(artifact_path)
    ))
  );
create policy ap_review_select on public.ap_coach_reviews
  for select to authenticated using (app_private.ap_can_view_submission(submission_id));
create policy ap_review_insert on public.ap_coach_reviews
  for insert to authenticated with check (
    coach_id=(select auth.uid())
    and app_private.ap_is_coach(app_private.ap_submission_learner(submission_id))
  );
create policy ap_data_select on public.ap_data_requests
  for select to authenticated using (guardian_id=(select auth.uid()));
create policy ap_data_insert on public.ap_data_requests
  for insert to authenticated with check (
    guardian_id=(select auth.uid())
    and (learner_id is null or app_private.ap_is_guardian(learner_id))
  );

-- Private files; never use a public Storage bucket for children's work.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('aperture-learner-work','aperture-learner-work',false,5242880,
       array['application/pdf','text/plain','image/png'])
on conflict (id) do update set
 public=false, file_size_limit=5242880,
 allowed_mime_types=array['application/pdf','text/plain','image/png'];

create policy ap_file_select on storage.objects for select to authenticated
  using (bucket_id='aperture-learner-work' and app_private.ap_can_view_file(name));
create policy ap_file_insert on storage.objects for insert to authenticated
  with check (bucket_id='aperture-learner-work' and app_private.ap_can_upload_file(name));

commit;

-- MANUAL SECURITY GATE (do not skip):
-- Test anonymous SELECT/INSERT denial on every public.ap_* table.
-- Test guardian A cannot read learner B, project B or artifact B.
-- Test coach without active assignment cannot read, review, or upload files.
-- Test active coach can review, but cannot create guardian submission or update review.
-- Test guardian cannot insert coach review or assign a coach.
-- Test update/delete/truncate are denied to browser-authenticated users.
-- Test storage bucket is private and anonymous file URLs are denied.
-- Test 7–17 age bands and age-appropriate adult consent before actual enrollment.
-- Until these pass, leave learning/portal/config.js blank and do not collect child data.
