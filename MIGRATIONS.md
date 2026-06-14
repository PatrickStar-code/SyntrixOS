# Migration Management

## Overview

This project uses a custom migration system built on `postgres.js` that tracks applied migrations in a `_migrations` table.

## Commands

```bash
# Show migration status
npm run db:migrate:status

# Run all pending migrations
npm run db:migrate

# Rollback last migration (removes record only - manual SQL needed for actual rollback)
npm run db:migrate:rollback
```

## How It Works

1. **Migration Files**: SQL files in `supabase/migrations/` (named with timestamp prefix)
2. **Tracking Table**: `_migrations` table stores applied migration names
3. **Execution**: Migrations run in alphabetical order (timestamp-based naming ensures correct order)

## Migration Files

Current migrations (in execution order):

| #   | File                                                    | Description                                                                         |
| --- | ------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 1   | `20250612193000_create_ideas_tables.sql`                | users, tags, ideas, idea_tags tables with RLS                                       |
| 2   | `20250612200000_update_schema_for_ideas_and_future.sql` | Schema updates, constraints, indexes                                                |
| 3   | `20250613000000_create_complete_schema.sql`             | accounts, categories, transactions, projects, tasks, courses, course_modules, notes |

## Running Migrations on Neon

### Option 1: Neon SQL Editor (Recommended for first setup)

1. Go to your Neon project dashboard
2. Open **SQL Editor**
3. Copy and paste each migration file content in order
4. Run each one

### Option 2: Using the CLI (requires DATABASE_URL)

```bash
# Set your Neon connection string
export DATABASE_URL="postgresql://user:***@ep-xxx.neon.tech/dbname?sslmode=require"

# Check status
npm run db:migrate:status

# Run migrations
npm run db:migrate
```

### Option 3: Using psql directly

```bash
psql "$DATABASE_URL" -f migrations/20250612193000_create_ideas_tables.sql
psql "$DATABASE_URL" -f migrations/20250612200000_update_schema_for_ideas_and_future.sql
psql "$DATABASE_URL" -f migrations/20250613000000_create_complete_schema.sql
```

## Creating New Migrations

1. Create a new SQL file in `supabase/migrations/` with timestamp prefix:

   ```bash
   # Example: 20250614000000_add_user_preferences.sql
   ```

2. Write your migration SQL (use `IF NOT EXISTS` for idempotency):

   ```sql
   CREATE TABLE IF NOT EXISTS public.user_preferences (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
     theme TEXT NOT NULL DEFAULT 'system',
     language TEXT NOT NULL DEFAULT 'pt-BR',
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
   );

   ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "Users can manage their own preferences"
   ON public.user_preferences FOR ALL
   USING (user_id = (SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_clerk_id')));
   ```

3. Run the migration:
   ```bash
   npm run db:migrate
   ```

## CI/CD Integration

Add to your deployment pipeline (GitHub Actions, GitLab CI, etc.):

```yaml
# .github/workflows/deploy.yml
- name: Run Database Migrations
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
  run: npm run db:migrate
```

## Important Notes

- **Always backup** before running migrations in production
- Migrations are **not automatically rolled back** - the rollback command only removes the tracking record
- For complex rollbacks, create a "down" migration file manually
- The `_migrations` table is created automatically on first run
- Use `IF NOT EXISTS` / `IF EXISTS` for safe re-runs
