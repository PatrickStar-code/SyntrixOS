-- Migration: Create Ideas, Tags, and Idea-Tags tables with RLS
-- Description: Tables for the Ideias module with full RLS support

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tags table
CREATE TABLE public.tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#3b82f6',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ideas table
CREATE TABLE public.ideas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'Novo' CHECK (status IN ('Novo', 'Rascunho', 'Validando', 'Pronto')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Many-to-many relationship between ideas and tags
CREATE TABLE public.idea_tags (
    idea_id UUID NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (idea_id, tag_id)
);

-- Indexes for performance
CREATE INDEX idx_tags_user_id ON public.tags(user_id);
CREATE INDEX idx_ideas_user_id ON public.ideas(user_id);
CREATE INDEX idx_ideas_user_id_status ON public.ideas(user_id, status);
CREATE INDEX idx_ideas_user_id_created_at ON public.ideas(user_id, created_at DESC);
CREATE INDEX idx_idea_tags_idea_id ON public.idea_tags(idea_id);
CREATE INDEX idx_idea_tags_tag_id ON public.idea_tags(tag_id);

-- Enable Row Level Security
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idea_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tags
CREATE POLICY "Users can view their own tags"
    ON public.tags FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tags"
    ON public.tags FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tags"
    ON public.tags FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tags"
    ON public.tags FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for ideas
CREATE POLICY "Users can view their own ideas"
    ON public.ideas FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ideas"
    ON public.ideas FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ideas"
    ON public.ideas FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ideas"
    ON public.ideas FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for idea_tags (users can only manage tags for their own ideas)
CREATE POLICY "Users can view their own idea_tags"
    ON public.idea_tags FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.ideas i
            WHERE i.id = idea_tags.idea_id
            AND i.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own idea_tags"
    ON public.idea_tags FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.ideas i
            WHERE i.id = idea_tags.idea_id
            AND i.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own idea_tags"
    ON public.idea_tags FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.ideas i
            WHERE i.id = idea_tags.idea_id
            AND i.user_id = auth.uid()
        )
    );

-- Triggers to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_tags_updated_at
    BEFORE UPDATE ON public.tags
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_ideas_updated_at
    BEFORE UPDATE ON public.ideas
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Grant permissions to authenticated role
GRANT ALL ON public.tags TO authenticated;
GRANT ALL ON public.ideas TO authenticated;
GRANT ALL ON public.idea_tags TO authenticated;