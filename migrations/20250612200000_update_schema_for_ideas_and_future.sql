-- Migration: Update schema for ideas, tags, and future modules
-- Description: Idempotent schema updates. Safe to run on fresh or existing DBs.
-- After 20250612193000 (which creates users, tags, ideas, idea_tags).

-- ============================================================
-- 1. IDEAS TABLE — ensure all columns exist
-- ============================================================

ALTER TABLE public.ideas ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.ideas ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'Novo';
ALTER TABLE public.ideas ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Add check constraint only if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'ideas_status_check'
    AND conrelid = 'public.ideas'::regclass
  ) THEN
    ALTER TABLE public.ideas
    ADD CONSTRAINT ideas_status_check
    CHECK (status IN ('Novo', 'Rascunho', 'Validando', 'Pronto'));
  END IF;
END $$;

-- Fix column types if needed (TIMESTAMP -> TIMESTAMPTZ)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'ideas'
    AND column_name = 'created_at' AND data_type = 'timestamp without time zone'
  ) THEN
    ALTER TABLE public.ideas ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'ideas'
    AND column_name = 'updated_at' AND data_type = 'timestamp without time zone'
  ) THEN
    ALTER TABLE public.ideas ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at AT TIME ZONE 'UTC';
  END IF;
END $$;

-- ============================================================
-- 2. TAGS TABLE — ensure all columns exist
-- ============================================================

ALTER TABLE public.tags ADD COLUMN IF NOT EXISTS color TEXT NOT NULL DEFAULT '#3b82f6';
ALTER TABLE public.tags ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.tags ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'tags'
    AND column_name = 'created_at' AND data_type = 'timestamp without time zone'
  ) THEN
    ALTER TABLE public.tags ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'tags'
    AND column_name = 'updated_at' AND data_type = 'timestamp without time zone'
  ) THEN
    ALTER TABLE public.tags ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at AT TIME ZONE 'UTC';
  END IF;
END $$;

-- ============================================================
-- 3. USERS TABLE — ensure clerk_id column exists (backfill for older schemas)
-- ============================================================

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS clerk_id TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Add unique constraint on clerk_id if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'users_clerk_id_key'
    AND conrelid = 'public.users'::regclass
  ) THEN
    ALTER TABLE public.users ADD CONSTRAINT users_clerk_id_key UNIQUE (clerk_id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users'
    AND column_name = 'created_at' AND data_type = 'timestamp without time zone'
  ) THEN
    ALTER TABLE public.users ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC';
  END IF;
END $$;

-- ============================================================
-- 4. ADDITIONAL INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_ideas_user_id_status     ON public.ideas(user_id, status);
CREATE INDEX IF NOT EXISTS idx_ideas_user_id_created_at ON public.ideas(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ideas_user_id_updated_at ON public.ideas(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_tags_user_id             ON public.tags(user_id);
CREATE INDEX IF NOT EXISTS idx_idea_tags_idea_id        ON public.idea_tags(idea_id);
CREATE INDEX IF NOT EXISTS idx_idea_tags_tag_id         ON public.idea_tags(tag_id);

-- ============================================================
-- 5. RLS — enable (idempotent) and refresh policies
-- ============================================================

ALTER TABLE public.ideas     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idea_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users     ENABLE ROW LEVEL SECURITY;

-- Table comments
COMMENT ON TABLE public.ideas     IS 'Ideias do usuário com status Kanban (Novo, Rascunho, Validando, Pronto)';
COMMENT ON TABLE public.tags      IS 'Tags coloridas para categorizar ideias';
COMMENT ON TABLE public.idea_tags IS 'Relacionamento many-to-many entre ideas e tags';
COMMENT ON COLUMN public.ideas.status IS 'Status do Kanban: Novo, Rascunho, Validando, Pronto';
COMMENT ON COLUMN public.tags.color   IS 'Cor hexadecimal da tag (ex: #ef4444)';
COMMENT ON COLUMN public.ideas.description IS 'Descrição detalhada da ideia (markdown suportado)';
COMMENT ON COLUMN public.users.clerk_id   IS 'Clerk user ID (auth provider). Used to link public.users to the authenticated session.';