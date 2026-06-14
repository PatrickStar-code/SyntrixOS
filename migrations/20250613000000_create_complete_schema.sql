-- Migration: Complete schema — remaining modules (accounts, categories, transactions, projects, tasks, courses, etc.)
-- Description: Creates all tables beyond the base (users, ideas, tags) created in 20250612193000.
-- All CREATE TABLE statements use IF NOT EXISTS so this migration is safe to re-run.
-- Auth: Clerk (clerk_id on public.users), NOT Supabase Auth.
-- RLS uses session variable app.current_clerk_id set by the application per request.

-- ============================================================
-- EXTENSIONS (safe to repeat)
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Trigger function (safe to repeat)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 1. ACCOUNTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.accounts (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name       TEXT NOT NULL,
    type       TEXT NOT NULL CHECK (type IN ('checking', 'savings', 'investment', 'credit', 'cash', 'other')),
    balance    DECIMAL(15,2) NOT NULL DEFAULT 0,
    currency   TEXT NOT NULL DEFAULT 'BRL',
    color      TEXT,
    icon       TEXT,
    is_active  BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts(user_id);
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own accounts"   ON public.accounts FOR SELECT USING (user_id = (SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id', true)));
CREATE POLICY "Users can insert their own accounts" ON public.accounts FOR INSERT WITH CHECK (user_id = (SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id', true)));
CREATE POLICY "Users can update their own accounts" ON public.accounts FOR UPDATE USING (user_id = (SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id', true))) WITH CHECK (user_id = (SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id', true)));
CREATE POLICY "Users can delete their own accounts" ON public.accounts FOR DELETE USING (user_id = (SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id', true)));

DROP TRIGGER IF EXISTS trigger_accounts_updated_at ON public.accounts;
CREATE TRIGGER trigger_accounts_updated_at BEFORE UPDATE ON public.accounts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 2. CATEGORIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name       TEXT NOT NULL,
    type       TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
    color      TEXT NOT NULL DEFAULT '#3b82f6',
    icon       TEXT,
    parent_id  UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    is_active  BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_user_id   ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own categories"   ON public.categories FOR SELECT USING (user_id = (SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id', true)));
CREATE POLICY "Users can insert their own categories" ON public.categories FOR INSERT WITH CHECK (user_id = (SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id', true)));
CREATE POLICY "Users can update their own categories" ON public.categories FOR UPDATE USING (user_id = (SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id', true))) WITH CHECK (user_id = (SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id', true)));
CREATE POLICY "Users can delete their own categories" ON public.categories FOR DELETE USING (user_id = (SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id', true)));

DROP TRIGGER IF EXISTS trigger_categories_updated_at ON public.categories;
CREATE TRIGGER trigger_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 3. TRANSACTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    account_id      UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    category_id     UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    tag_id          UUID REFERENCES public.tags(id) ON DELETE SET NULL,
    type            TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
    amount          DECIMAL(15,2) NOT NULL,
    description     TEXT,
    date            DATE NOT NULL DEFAULT CURRENT_DATE,
    is_recurring    BOOLEAN NOT NULL DEFAULT false,
    recurrence_rule TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id      ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id   ON public.transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id  ON public.transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date         ON public.transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id_date ON public.transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type         ON public.transactions(type);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"   ON public.transactions FOR SELECT USING (user_id = (SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id', true)));
CREATE POLICY "Users can insert their own transactions" ON public.transactions FOR INSERT WITH CHECK (user_id = (SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id', true)));
CREATE POLICY "Users can update their own transactions" ON public.transactions FOR UPDATE USING (user_id = (SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id', true))) WITH CHECK (user_id = (SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id', true)));
CREATE POLICY "Users can delete their own transactions" ON public.transactions FOR DELETE USING (user_id = (SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id', true)));

DROP TRIGGER IF EXISTS trigger_transactions_updated_at ON public.transactions;
CREATE TRIGGER trigger_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 4. PROJECTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.projects (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    description TEXT,
    status      TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'pausado', 'concluido', 'arquivado')),
    color       TEXT NOT NULL DEFAULT '#3b82f6',
    start_date  DATE,
    end_date    DATE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id        ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id_status ON public.projects(user_id, status);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own projects"   ON public.projects FOR SELECT USING (user_id = (SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id', true)));
CREATE POLICY "Users can insert their own projects" ON public.projects FOR INSERT WITH CHECK (user_id = (SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id', true)));
CREATE POLICY "Users can update their own projects" ON public.projects FOR UPDATE USING (user_id = (SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id', true))) WITH CHECK (user_id = (SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id', true)));
CREATE POLICY "Users can delete their own projects" ON public.projects FOR DELETE USING (user_id = (SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id', true)));

DROP TRIGGER IF EXISTS trigger_projects_updated_at ON public.projects;
CREATE TRIGGER trigger_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 5. TASKS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tasks (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    project_id   UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    title        TEXT NOT NULL,
    description  TEXT,
    status       TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluida', 'cancelada')),
    priority     TEXT NOT NULL DEFAULT 'media' CHECK (priority IN ('baixa', 'media', 'alta', 'urgente')),
    due_date     TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_user_id        ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id     ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id_status ON public.tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date       ON public.tasks(due_date);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tasks"   ON public.tasks FOR SELECT USING (user_id = (SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id', true)));
CREATE POLICY "Users can insert their own tasks" ON public.tasks FOR INSERT WITH CHECK (user_id = (SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id', true)));
CREATE POLICY "Users can update their own tasks" ON public.tasks FOR UPDATE USING (user_id = (SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id', true))) WITH CHECK (user_id = (SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id', true)));
CREATE POLICY "Users can delete their own tasks" ON public.tasks FOR DELETE USING (user_id = (SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id', true)));

DROP TRIGGER IF EXISTS trigger_tasks_updated_at ON public.tasks;
CREATE TRIGGER trigger_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 6. COURSES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.courses (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name             TEXT NOT NULL,
    description      TEXT,
    status           TEXT NOT NULL DEFAULT 'planejado' CHECK (status IN ('planejado', 'em_andamento', 'concluido', 'pausado')),
    platform         TEXT,
    url              TEXT,
    instructor       TEXT,
    total_hours      DECIMAL(5,2),
    completed_hours  DECIMAL(5,2) DEFAULT 0,
    start_date       DATE,
    end_date         DATE,
    certificate_url  TEXT,
    rating           INTEGER CHECK (rating BETWEEN 1 AND 5),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_courses_user_id        ON public.courses(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_user_id_status ON public.courses(user_id, status);
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own courses"   ON public.courses FOR SELECT USING (user_id = (SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id', true)));
CREATE POLICY "Users can insert their own courses" ON public.courses FOR INSERT WITH CHECK (user_id = (SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id', true)));
CREATE POLICY "Users can update their own courses" ON public.courses FOR UPDATE USING (user_id = (SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id', true))) WITH CHECK (user_id = (SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id', true)));
CREATE POLICY "Users can delete their own courses" ON public.courses FOR DELETE USING (user_id = (SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id', true)));

DROP TRIGGER IF EXISTS trigger_courses_updated_at ON public.courses;
CREATE TRIGGER trigger_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 7. COURSE_MODULES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.course_modules (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id        UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title            TEXT NOT NULL,
    description      TEXT,
    order_index      INTEGER NOT NULL DEFAULT 0,
    duration_minutes INTEGER,
    is_completed     BOOLEAN NOT NULL DEFAULT false,
    completed_at     TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON public.course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_course_modules_user_id   ON public.course_modules(user_id);
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own course modules"   ON public.course_modules FOR SELECT USING (user_id = (SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id', true)));
CREATE POLICY "Users can insert their own course modules" ON public.course_modules FOR INSERT WITH CHECK (user_id = (SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id', true)));
CREATE POLICY "Users can update their own course modules" ON public.course_modules FOR UPDATE USING (user_id = (SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id', true))) WITH CHECK (user_id = (SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id', true)));
CREATE POLICY "Users can delete their own course modules" ON public.course_modules FOR DELETE USING (user_id = (SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id', true)));

DROP TRIGGER IF EXISTS trigger_course_modules_updated_at ON public.course_modules;
CREATE TRIGGER trigger_course_modules_updated_at BEFORE UPDATE ON public.course_modules FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 8. NOTES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notes (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title      TEXT NOT NULL,
    content    TEXT,
    is_pinned  BOOLEAN NOT NULL DEFAULT false,
    tags       UUID[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notes_user_id  ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_is_pinned ON public.notes(user_id, is_pinned) WHERE is_pinned;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notes"   ON public.notes FOR SELECT USING (user_id = (SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id', true)));
CREATE POLICY "Users can insert their own notes" ON public.notes FOR INSERT WITH CHECK (user_id = (SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id', true)));
CREATE POLICY "Users can update their own notes" ON public.notes FOR UPDATE USING (user_id = (SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id', true))) WITH CHECK (user_id = (SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id', true)));
CREATE POLICY "Users can delete their own notes" ON public.notes FOR DELETE USING (user_id = (SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id', true)));

DROP TRIGGER IF EXISTS trigger_notes_updated_at ON public.notes;
CREATE TRIGGER trigger_notes_updated_at BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();