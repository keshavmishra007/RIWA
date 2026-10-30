-- ====================================================================
-- RiWA — Rewa Intelligence For Watch and Action
-- Database Schema Migration for Supabase / PostgreSQL
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USERS TABLE (Custom JWT Auth with bcrypt)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('CITIZEN', 'AUTHORITY', 'ADMIN')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. INCIDENTS TABLE (Fused Civic Incidents)
CREATE TABLE IF NOT EXISTS incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_code VARCHAR(50) UNIQUE NOT NULL, -- e.g. INC-104
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL CHECK (category IN ('drainage', 'garbage', 'road_damage', 'electrical_hazard', 'other')),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  priority VARCHAR(50) NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  status VARCHAR(50) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REOPENED', 'CLOSED')),
  fusion_confidence DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  summary TEXT,
  ai_brief TEXT,
  recommended_actions JSONB DEFAULT '[]'::jsonb,
  report_count INT NOT NULL DEFAULT 1,
  area_km DOUBLE PRECISION NOT NULL DEFAULT 0.5,
  trend VARCHAR(50) NOT NULL DEFAULT 'STABLE' CHECK (trend IN ('STABLE', 'RISING', 'RAPIDLY_RISING')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. COMPLAINTS TABLE (Individual Citizen Reports)
CREATE TABLE IF NOT EXISTS complaints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_code VARCHAR(50) UNIQUE NOT NULL, -- e.g. R-201
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  raw_text TEXT,
  image_url TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  category VARCHAR(100) CHECK (category IN ('drainage', 'garbage', 'road_damage', 'electrical_hazard', 'other')),
  status VARCHAR(50) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REOPENED', 'CLOSED')),
  incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. AI ANALYSES TABLE (Structured LLM Understanding & Embeddings)
CREATE TABLE IF NOT EXISTS ai_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  severity VARCHAR(50) NOT NULL,
  summary TEXT,
  department VARCHAR(100),
  confidence DOUBLE PRECISION NOT NULL,
  keywords JSONB DEFAULT '[]'::jsonb,
  hazards JSONB DEFAULT '[]'::jsonb,
  sensitive_locations JSONB DEFAULT '[]'::jsonb,
  embedding JSONB, -- Stores the 768-dim float vector from text-embedding-004
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. INCIDENT REPORTS TABLE (Explainable Fusion Association)
CREATE TABLE IF NOT EXISTS incident_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
  complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
  fusion_score DOUBLE PRECISION NOT NULL,
  semantic_score DOUBLE PRECISION NOT NULL,
  location_score DOUBLE PRECISION NOT NULL,
  time_score DOUBLE PRECISION NOT NULL,
  category_score DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(incident_id, complaint_id)
);

-- 7. STATUS LOGS TABLE (Lifecycle & Audit Trail)
CREATE TABLE IF NOT EXISTS status_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_name VARCHAR(255) NOT NULL,
  note TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 8. HOTSPOTS TABLE (Civic Hotspot Detection Clusters)
CREATE TABLE IF NOT EXISTS hotspots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotspot_code VARCHAR(50) UNIQUE NOT NULL, -- e.g. HS-01
  label VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  severity VARCHAR(50) NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  radius DOUBLE PRECISION NOT NULL DEFAULT 500,
  report_count INT NOT NULL DEFAULT 0,
  incident_count INT NOT NULL DEFAULT 0,
  trend VARCHAR(50) NOT NULL DEFAULT 'STABLE',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for high-performance spatial & temporal queries
CREATE INDEX IF NOT EXISTS idx_complaints_coords ON complaints(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category);
CREATE INDEX IF NOT EXISTS idx_complaints_incident ON complaints(incident_id);
CREATE INDEX IF NOT EXISTS idx_incidents_coords ON incidents(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_incidents_priority ON incidents(priority);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incident_reports_incident ON incident_reports(incident_id);
