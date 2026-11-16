-- APERTURE Instructor Platform v1: pseudonymous records only.
-- Execute in a dedicated Supabase project AFTER reviewing privacy and authorization.
create extension if not exists pgcrypto;
create table public.organizations(id uuid primary key default gen_random_uuid(), name text not null check(length(name) between 2 and 120), created_at timestamptz not null default now());
create table public.memberships(org_id uuid not null references public.organizations(id) on delete cascade,user_id uuid not null references auth.users(id) on delete cascade,role text not null check(role in ('admin','instructor')),primary key(org_id,user_id));
create table public.classes(id uuid primary key default gen_random_uuid(),org_id uuid not null references public.organizations(id) on delete cascade,name text not null check(length(name) between 1 and 120),created_at timestamptz not null default now(),unique(id,org_id));
create table public.class_instructors(class_id uuid not null references public.classes(id) on delete cascade,user_id uuid not null references auth.users(id) on delete cascade,primary key(class_id,user_id));
create table public.learners(id uuid primary key default gen_random_uuid(),org_id uuid not null references public.organizations(id) on delete cascade,code text not null check(code ~ '^[A-Z0-9-]{3,32}$'),created_at timestamptz not null default now(),unique(org_id,code),unique(id,org_id));
create table public.enrollments(class_id uuid not null,learner_id uuid not null,org_id uuid not null,primary key(class_id,learner_id),foreign key(class_id,org_id) references public.classes(id,org_id) on delete cascade,foreign key(learner_id,org_id) references public.learners(id,org_id) on delete cascade);
create table public.assignments(id uuid primary key default gen_random_uuid(),class_id uuid not null references public.classes(id) on delete cascade,lesson text not null check(lesson in ('scratch','makecode','python','showcase')),due_at timestamptz);
create table public.assessments(id uuid primary key default gen_random_uuid(),assignment_id uuid not null references public.assignments(id) on delete cascade,learner_id uuid not null references public.learners(id) on delete cascade,reviewer_id uuid not null references auth.users(id),functionality integer not null check(functionality between 0 and 3),concepts integer not null check(concepts between 0 and 3),testing integer not null check(testing between 0 and 2),communication integer not null check(communication between 0 and 2),completed boolean not null default false,updated_at timestamptz not null default now(),unique(assignment_id,learner_id));
create table public.audit_events(id bigint generated always as identity primary key,actor_id uuid not null,action text not null,record_type text not null,record_id uuid not null,created_at timestamptz not null default now());
-- Do not store guardian details or assert consent until a reviewed verified-consent service is implemented.
create or replace function public.is_org_admin(o uuid) returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.memberships m where m.org_id=o and m.user_id=(select auth.uid()) and m.role='admin') $$;
create or replace function public.can_access_class(c uuid) returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.classes x join public.memberships m on m.org_id=x.org_id where x.id=c and m.user_id=(select auth.uid()) and (m.role='admin' or exists(select 1 from public.class_instructors ci where ci.class_id=x.id and ci.user_id=m.user_id))) $$;
create or replace function public.can_access_org(o uuid) returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.memberships m where m.org_id=o and m.user_id=(select auth.uid())) $$;
revoke all on function public.is_org_admin(uuid),public.can_access_class(uuid),public.can_access_org(uuid) from public;
grant execute on function public.is_org_admin(uuid),public.can_access_class(uuid),public.can_access_org(uuid) to authenticated;
alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.classes enable row level security;
alter table public.class_instructors enable row level security;
alter table public.learners enable row level security;
alter table public.enrollments enable row level security;
alter table public.assignments enable row level security;
alter table public.assessments enable row level security;
alter table public.audit_events enable row level security;
create policy org_read on public.organizations for select to authenticated using (public.can_access_org(id));
create policy membership_read on public.memberships for select to authenticated using (user_id=(select auth.uid()) or public.is_org_admin(org_id));
create policy class_read on public.classes for select to authenticated using (public.can_access_class(id));
create policy class_insert on public.classes for insert to authenticated with check (public.is_org_admin(org_id));
create policy class_update on public.classes for update to authenticated using (public.is_org_admin(org_id)) with check (public.is_org_admin(org_id));
create policy instructor_read on public.class_instructors for select to authenticated using (public.can_access_class(class_id));
create policy learner_read on public.learners for select to authenticated using (exists(select 1 from public.enrollments e where e.learner_id=id and public.can_access_class(e.class_id)));
create policy learner_insert on public.learners for insert to authenticated with check (public.is_org_admin(org_id));
create policy enrollment_read on public.enrollments for select to authenticated using (public.can_access_class(class_id));
create policy enrollment_insert on public.enrollments for insert to authenticated with check (public.can_access_class(class_id) and public.is_org_admin(org_id));
create policy assignment_read on public.assignments for select to authenticated using (public.can_access_class(class_id));
create policy assignment_insert on public.assignments for insert to authenticated with check (public.can_access_class(class_id));
create policy assessment_read on public.assessments for select to authenticated using (exists(select 1 from public.assignments a join public.enrollments e on e.class_id=a.class_id and e.learner_id=assessments.learner_id where a.id=assessments.assignment_id and public.can_access_class(a.class_id)));
create policy assessment_insert on public.assessments for insert to authenticated with check (reviewer_id=(select auth.uid()) and exists(select 1 from public.assignments a join public.enrollments e on e.class_id=a.class_id and e.learner_id=assessments.learner_id where a.id=assessments.assignment_id and public.can_access_class(a.class_id)));
create policy assessment_update on public.assessments for update to authenticated using (exists(select 1 from public.assignments a where a.id=assessments.assignment_id and public.can_access_class(a.class_id))) with check (reviewer_id=(select auth.uid()) and exists(select 1 from public.assignments a join public.enrollments e on e.class_id=a.class_id and e.learner_id=assessments.learner_id where a.id=assessments.assignment_id and public.can_access_class(a.class_id)));
-- audit writes via database trigger, not browser; immutable to application roles.
create or replace function public.log_assessment_change() returns trigger language plpgsql security definer set search_path='' as $$ begin insert into public.audit_events(actor_id,action,record_type,record_id) values ((select auth.uid()),TG_OP,'assessment',new.id); return new; end $$;
create trigger assessment_audit after insert or update on public.assessments for each row execute function public.log_assessment_change();
revoke all on public.audit_events from anon,authenticated;
-- Bootstrap organizations and memberships only from trusted administrative SQL/service operations.
-- Before production: add consent service, retention/deletion procedures, auth MFA policy, rate limiting, and security tests.
