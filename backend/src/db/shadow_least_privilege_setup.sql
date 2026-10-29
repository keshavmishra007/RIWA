-- ============================================================================
-- RIWA Civic Intelligence: Shadow Fusion Least-Privilege Identity & Storage
-- ============================================================================
-- IMPORTANT / SAFETY NOTICE:
-- DO NOT APPLY THIS SCRIPT DIRECTLY TO PRODUCTION SUPABASE WITHOUT EXPLICIT APPROVAL.
-- This file documents the required database-level permission boundary for when
-- remote shadow-mode persistence is authorized.
-- ============================================================================

-- 1. Create Isolated Shadow Output Table
CREATE TABLE IF NOT EXISTS public.shadow_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  complaint_code_a VARCHAR(64) NOT NULL,
  complaint_code_b VARCHAR(64) NOT NULL,
  baseline_decision VARCHAR(32) NOT NULL,
  baseline_score NUMERIC(5, 4) NOT NULL,
  shadow_recommendation VARCHAR(32) NOT NULL, -- 'CONFIRM_MERGE' | 'DEMOTE_SEPARATE' | 'MAINTAIN_REVIEW' | 'SKIPPED' | 'ERROR'
  visual_score NUMERIC(5, 4),
  visual_uncertainty VARCHAR(16),             -- 'LOW' | 'MEDIUM' | 'HIGH'
  rationale TEXT,
  latency_ms INTEGER NOT NULL,
  model_version VARCHAR(64) NOT NULL,
  status VARCHAR(32) NOT NULL,                -- 'SUCCESS' | 'SKIPPED' | 'MALFORMED_RESPONSE' | 'API_ERROR'
  error_details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for efficient offline audit queries by date and recommendation
CREATE INDEX IF NOT EXISTS idx_shadow_eval_rec ON public.shadow_evaluations (shadow_recommendation);
CREATE INDEX IF NOT EXISTS idx_shadow_eval_date ON public.shadow_evaluations (evaluated_at DESC);

-- ============================================================================
-- 2. LEAST-PRIVILEGE ROLE DEFINITION
-- ============================================================================

-- Create dedicated database role for shadow evaluation worker
-- (Password must be provided via secure secret manager upon deployment)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'riwa_shadow_worker') THEN
    CREATE ROLE riwa_shadow_worker WITH LOGIN PASSWORD 'REPLACE_WITH_STRONG_GENERATED_PASSWORD';
  END IF;
END
$$;

-- Grant basic database connection & schema access
GRANT CONNECT ON DATABASE postgres TO riwa_shadow_worker;
GRANT USAGE ON SCHEMA public TO riwa_shadow_worker;

-- ============================================================================
-- 3. PERMISSION BOUNDARIES: READ OPERATIONAL DATA, INSERT SHADOW OUTPUT ONLY
-- ============================================================================

-- Read-only permission on operational tables required for fusion calculation
GRANT SELECT ON TABLE public.complaints TO riwa_shadow_worker;
GRANT SELECT ON TABLE public.incidents TO riwa_shadow_worker;
GRANT SELECT ON TABLE public.incident_reports TO riwa_shadow_worker;
GRANT SELECT ON TABLE public.ai_analyses TO riwa_shadow_worker;

-- Insert-only permission on the isolated shadow table
GRANT SELECT, INSERT ON TABLE public.shadow_evaluations TO riwa_shadow_worker;

-- ============================================================================
-- 4. HARD ENGINE-ENFORCED REVOCATIONS (TECHNICAL WRITE ISOLATION)
-- ============================================================================
-- These commands guarantee that even if the worker code is compromised or bugged,
-- the PostgreSQL engine itself will reject any attempt to mutate operational tables.

REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.complaints FROM riwa_shadow_worker;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.incidents FROM riwa_shadow_worker;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.incident_reports FROM riwa_shadow_worker;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.departments FROM riwa_shadow_worker;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.status_logs FROM riwa_shadow_worker;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.hotspots FROM riwa_shadow_worker;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.users FROM riwa_shadow_worker;
REVOKE UPDATE, DELETE, TRUNCATE ON TABLE public.shadow_evaluations FROM riwa_shadow_worker;

-- Disallow schema modifications or superuser privileges
ALTER ROLE riwa_shadow_worker NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
