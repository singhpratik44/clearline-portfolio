-- APERTURE transactional integration tests. Run with privileged SQL runner only.
-- All test writes are rolled back; no grades or students persist.
begin;
create temporary table aperture_test_results(name text, passed boolean, detail text) on commit drop;
insert into public.organizations(name) values ('APERTURE TEST ISOLATED') returning id;
-- For repeatable, isolated tests use the full pgTAP suite in a local Supabase environment.
-- This smoke test checks the deployed database and ensures the authenticated role has no audit access.
insert into aperture_test_results select 'RLS enabled',bool_and(rowsecurity),null from pg_tables where schemaname='public' and tablename in ('organizations','memberships','classes','class_instructors','learners','enrollments','assignments','assessments','audit_events');
insert into aperture_test_results select 'No audit grants',not has_table_privilege('authenticated','public.audit_events','SELECT'),null;
insert into aperture_test_results select 'No anonymous learner access',not has_table_privilege('anon','public.learners','SELECT'),null;
select * from aperture_test_results;
rollback;
