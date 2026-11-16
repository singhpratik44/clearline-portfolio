-- APERTURE enterprise foundation
-- Apply to Cloudflare D1 after creating a database. No real learner data belongs here until consent and access controls are configured.
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS organizations (id TEXT PRIMARY KEY, name TEXT NOT NULL, plan TEXT NOT NULL DEFAULT 'pilot', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, organization_id TEXT REFERENCES organizations(id), role TEXT NOT NULL CHECK(role IN ('learner','parent','facilitator','partner_admin','platform_admin')), display_name TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, organization_id TEXT NOT NULL REFERENCES organizations(id), owner_user_id TEXT NOT NULL REFERENCES users(id), title TEXT NOT NULL, tool TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'draft', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS evidence (id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id), kind TEXT NOT NULL, uri TEXT, claim TEXT, reviewer_user_id TEXT REFERENCES users(id), review_status TEXT NOT NULL DEFAULT 'pending', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS approvals (id TEXT PRIMARY KEY, organization_id TEXT NOT NULL REFERENCES organizations(id), subject_type TEXT NOT NULL, subject_id TEXT NOT NULL, action TEXT NOT NULL, requested_by TEXT NOT NULL REFERENCES users(id), decided_by TEXT REFERENCES users(id), status TEXT NOT NULL DEFAULT 'pending', decided_at TEXT, notes TEXT);
CREATE TABLE IF NOT EXISTS audit_events (id TEXT PRIMARY KEY, organization_id TEXT REFERENCES organizations(id), actor_user_id TEXT REFERENCES users(id), event_type TEXT NOT NULL, subject_type TEXT, subject_id TEXT, metadata_json TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS idx_users_org ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_org ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_evidence_project ON evidence(project_id);
CREATE INDEX IF NOT EXISTS idx_audit_org_time ON audit_events(organization_id, created_at);
