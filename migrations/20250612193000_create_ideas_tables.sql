-- Migration: Create Users, Ideas, Tags, and Idea-Tags tables with RLS
-- Description: Base tables for SyntrixOS. Users table must come first.
-- Auth is handled by Clerk (not Supabase Auth), so we use clerk_id as the user identifier.
-- RLS uses session variable `app.current_clerk_id` set by the application per request.

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Helper function for updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 1. USERS TABLE
-- Linked to Clerk via clerk_id. This is NOT linked to auth.users
-- because this project uses Clerk for authentication.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id   TEXT UNIQUE NOT NULL,
    email      TEXT UNIQUE NOT NULL,
    full_name  TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
-- Uses session variable app.current_clerk_id (set by middleware/API per request)
CREATE POLICY "Users can view their own profile"
    ON public.users FOR SELECT
    USING (clerk_id = current_setting('app.current_clerk_id', true));

CREATE POLICY "Users can update their own profile"
    ON public.users FOR UPDATE
    USING (clerk_id = current_setting('app.current_clerk_id', true))
    WITH CHECK (clerk_id = current_setting('app.current_clerk_id', true));


-- Trigger for updated_at
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 2. TAGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tags (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name       TEXT NOT NULL,
    color      TEXT NOT NULL DEFAULT '#3b82f6',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON public.tags(user_id);

-- Enable RLS
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tags
CREATE POLICY "Users can view their own tags"
    ON public.tags FOR SELECT
    USING (user_id = (
        SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id', true)
    ));

CREATE POLICY "Users can insert their own tags"
    ON public.tags FOR INSERT
    WITH CHECK (user_id = (
        SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id', true)
    ));

CREATE POLICY "Users can update their own tags"
    ON public.tags FOR UPDATE
    USING (user_id = (
        SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id', true)
    ))
    WITH CHECK (user_id = (
        SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id', true)
    ));

CREATE POLICY "Users can delete their own tags"
    ON public.tags FOR DELETE
    USING (user_id = (
        SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id', true)
    ));

-- Trigger for updated_at
CREATE TRIGGER trigger_tags_updated_at
    BEFORE UPDATE ON public.tags
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 3. IDEAS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ideas (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content     TEXT NOT NULL,
    description TEXT,
    status      TEXT NOT NULL DEFAULT 'Novo'
                    CHECK (status IN ('Novo', 'Rascunho', 'Validando', 'Pronto')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ideas_user_id           ON public.ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_ideas_user_id_status    ON public.ideas(user_id, status);
CREATE INDEX IF NOT EXISTS idx_ideas_user_id_created_at ON public.ideas(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ideas_user_id_updated_at ON public.ideas(user_id, updated_at DESC);

-- Enable RLS
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ideas
CREATE POLICY "Users can view their own ideas"
    ON public.ideas FOR SELECT
    USING (user_id = (
        SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id', true)
    ));

CREATE POLICY "Users can insert their own ideas"
    ON public.ideas FOR INSERT
    WITH CHECK (user_id = (
        SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id', true)
    ));

CREATE POLICY "Users can update their own ideas"
    ON public.ideas FOR UPDATE
    USING (user_id = (
        SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id', true)
    ))
    WITH CHECK (user_id = (
        SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id', true)
    ));

CREATE POLICY "Users can delete their own ideas"
    ON public.ideas FOR DELETE
    USING (user_id = (
        SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id', true)
    ));

-- Trigger for updated_at
CREATE TRIGGER trigger_ideas_updated_at
    BEFORE UPDATE ON public.ideas
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 4. IDEA_TAGS TABLE (Many-to-many)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.idea_tags (
    idea_id UUID NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
    tag_id  UUID NOT NULL REFERENCES public.tags(id)  ON DELETE CASCADE,
    PRIMARY KEY (idea_id, tag_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_idea_tags_idea_id ON public.idea_tags(idea_id);
CREATE INDEX IF NOT EXISTS idx_idea_tags_tag_id  ON public.idea_tags(tag_id);

-- Enable RLS
ALTER TABLE public.idea_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for idea_tags (users can only manage tags for their own ideas)
CREATE POLICY "Users can view their own idea_tags"
    ON public.idea_tags FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.ideas i
            JOIN public.users u ON u.id = i.user_id
            WHERE i.id = idea_tags.idea_id
            AND u.clerk_id = current_setting('app.current_clerk_id', true)
        )
    );

CREATE POLICY "Users can insert their own idea_tags"
    ON public.idea_tags FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.ideas i
            JOIN public.users u ON u.id = i.user_id
            WHERE i.id = idea_tags.idea_id
            AND u.clerk_id = current_setting('app.current_clerk_id', true)
        )
    );

CREATE POLICY "Users can delete their own idea_tags"
    ON public.idea_tags FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.ideas i
            JOIN public.users u ON u.id = i.user_id
            WHERE i.id = idea_tags.idea_id
            AND u.clerk_id = current_setting('app.current_clerk_id', true)
        )
    );

-- Table comments
COMMENT ON TABLE public.users  IS 'Perfis de usuário sincronizados via Clerk webhook (clerk_id = Clerk user ID)';
COMMENT ON TABLE public.ideas  IS 'Ideias do usuário com status Kanban (Novo, Rascunho, Validando, Pronto)';
COMMENT ON TABLE public.tags   IS 'Tags coloridas para categorizar ideias';
COMMENT ON TABLE public.idea_tags IS 'Relacionamento many-to-many entre ideas e tags';