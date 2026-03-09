-- ============================================================
-- AI FASHION STUDIO — PostgreSQL Schema
-- Run this ONCE on a fresh database to bootstrap the schema.
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Companies ────────────────────────────────────────────────
CREATE TABLE companies (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name               VARCHAR(200) NOT NULL,
  slug               VARCHAR(100) UNIQUE NOT NULL,
  logo_url           TEXT,
  subscription_plan  VARCHAR(50) NOT NULL DEFAULT 'basic',   -- basic | premium | enterprise
  subscription_status VARCHAR(50) NOT NULL DEFAULT 'active', -- active | cancelled | past_due
  credit_balance     INTEGER NOT NULL DEFAULT 0 CHECK (credit_balance >= 0),
  max_users          INTEGER NOT NULL DEFAULT 1,
  settings           JSONB NOT NULL DEFAULT '{}',
  is_active          BOOLEAN NOT NULL DEFAULT true,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Users ────────────────────────────────────────────────────
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID REFERENCES companies(id) ON DELETE SET NULL,
  email         VARCHAR(320) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name     VARCHAR(200) NOT NULL,
  role          VARCHAR(50) NOT NULL DEFAULT 'user',   -- superadmin | company_admin | user
  status        VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  avatar_url    TEXT,
  settings      JSONB NOT NULL DEFAULT '{}',
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Password Reset Tokens ────────────────────────────────────
CREATE TABLE password_reset_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,   -- SHA-256 hash of the raw token sent to user
  expires_at TIMESTAMPTZ NOT NULL,
  used_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Refresh Tokens ───────────────────────────────────────────
CREATE TABLE refresh_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Avatars ──────────────────────────────────────────────────
CREATE TABLE avatars (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID REFERENCES companies(id) ON DELETE CASCADE,
  name        VARCHAR(200) NOT NULL,
  gender      VARCHAR(50),     -- male | female | non-binary
  ethnicity   VARCHAR(100),
  image_url   TEXT NOT NULL,
  thumbnail_url TEXT,
  status      VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  is_global   BOOLEAN NOT NULL DEFAULT false,         -- true = available to all companies
  created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Jobs ─────────────────────────────────────────────────────
CREATE TABLE jobs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id       UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  avatar_id        UUID REFERENCES avatars(id) ON DELETE SET NULL,
  type             VARCHAR(50) NOT NULL,   -- swap_model | image_gen | video_gen | bulk
  status           VARCHAR(50) NOT NULL DEFAULT 'queued', -- queued | processing | completed | failed | cancelled
  progress         SMALLINT NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  input_files      TEXT[] NOT NULL DEFAULT '{}',
  output_files     TEXT[] NOT NULL DEFAULT '{}',
  credits_used     INTEGER NOT NULL DEFAULT 0,
  error_code       VARCHAR(100),
  error_message    TEXT,
  prompt           TEXT,
  metadata         JSONB NOT NULL DEFAULT '{}',
  started_at       TIMESTAMPTZ,
  completed_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Credit Transactions ──────────────────────────────────────
CREATE TABLE credit_transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  job_id      UUID REFERENCES jobs(id) ON DELETE SET NULL,
  type        VARCHAR(50) NOT NULL,  -- purchase | usage | allocation | refund | adjustment
  amount      INTEGER NOT NULL,      -- positive = credit added, negative = deducted
  balance_after INTEGER NOT NULL,
  description TEXT NOT NULL,
  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Audit Log ────────────────────────────────────────────────
CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  company_id  UUID REFERENCES companies(id) ON DELETE SET NULL,
  action      VARCHAR(200) NOT NULL,
  entity_type VARCHAR(100),
  entity_id   UUID,
  old_value   JSONB,
  new_value   JSONB,
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX idx_credit_transactions_company_id ON credit_transactions(company_id);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
CREATE INDEX idx_avatars_company_id ON avatars(company_id);
CREATE INDEX idx_avatars_status ON avatars(status);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_company_id ON audit_logs(company_id);

-- ── Updated_at trigger ───────────────────────────────────────
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_companies BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_users BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_avatars BEFORE UPDATE ON avatars FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_jobs BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
