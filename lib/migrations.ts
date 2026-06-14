import { sql } from "@/lib/db";
import fs from "fs";
import path from "path";

const MIGRATIONS_DIR = path.join(process.cwd(), "migrations");

interface MigrationRecord {
  id: number;
  name: string;
  applied_at: Date;
}

/**
 * Initialize the migrations tracking table
 */
export async function initMigrationsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

/**
 * Get list of already applied migrations
 */
export async function getAppliedMigrations(): Promise<string[]> {
  await initMigrationsTable();
  const rows = await sql<MigrationRecord[]>`
    SELECT name FROM _migrations ORDER BY id
  `;
  return rows.map((r) => r.name);
}

/**
 * Get list of pending migrations from filesystem
 */
export function getPendingMigrations(applied: string[]): string[] {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    return [];
  }

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  return files.filter((f) => !applied.includes(f));
}

/**
 * Apply a single migration
 */
export async function applyMigration(filename: string): Promise<void> {
  const filepath = path.join(MIGRATIONS_DIR, filename);
  const sqlContent = fs.readFileSync(filepath, "utf-8");

  // Split by semicolon but be careful with function definitions
  // For simplicity, we'll execute the whole file as one statement
  // In production, you might want a more sophisticated parser
  await sql.unsafe(sqlContent);

  // Record the migration
  await sql`
    INSERT INTO _migrations (name) VALUES (${filename})
    ON CONFLICT (name) DO NOTHING
  `;

  console.log(`✓ Applied migration: ${filename}`);
}

/**
 * Run all pending migrations
 */
export async function runMigrations(): Promise<void> {
  console.log("🔍 Checking for pending migrations...");

  const applied = await getAppliedMigrations();
  const pending = getPendingMigrations(applied);

  if (pending.length === 0) {
    console.log("✅ No pending migrations. Database is up to date.");
    return;
  }

  console.log(`📦 Found ${pending.length} pending migration(s):`);
  pending.forEach((p) => console.log(`  - ${p}`));

  for (const migration of pending) {
    try {
      await applyMigration(migration);
    } catch (error) {
      console.error(`✗ Failed to apply migration: ${migration}`);
      throw error;
    }
  }

  console.log(`\n✅ Successfully applied ${pending.length} migration(s)!`);
}

/**
 * Rollback the last migration (for development only)
 */
export async function rollbackLastMigration(): Promise<void> {
  await initMigrationsTable();

  const last = await sql<MigrationRecord[]>`
    SELECT name FROM _migrations ORDER BY id DESC LIMIT 1
  `;

  if (last.length === 0) {
    console.log("No migrations to rollback");
    return;
  }

  const migrationName = last[0].name;
  console.log(`Rolling back: ${migrationName}`);

  // Note: Automatic rollback requires down migrations
  // This just removes the record - manual SQL needed for actual rollback
  await sql`DELETE FROM _migrations WHERE name = ${migrationName}`;
  console.log(`⚠ Removed migration record: ${migrationName}`);
  console.log(
    "  Note: You must manually run the reverse SQL to undo schema changes",
  );
}

/**
 * Show migration status
 */
export async function showMigrationStatus(): Promise<void> {
  await initMigrationsTable();

  const applied = await getAppliedMigrations();
  const pending = getPendingMigrations(applied);

  console.log("\n📊 Migration Status");
  console.log("===================");

  if (applied.length > 0) {
    console.log("\n✅ Applied:");
    applied.forEach((name, i) => console.log(`  ${i + 1}. ${name}`));
  } else {
    console.log("\n✅ Applied: (none)");
  }

  if (pending.length > 0) {
    console.log("\n⏳ Pending:");
    pending.forEach((name, i) => console.log(`  ${i + 1}. ${name}`));
  } else {
    console.log("\n⏳ Pending: (none)");
  }

  console.log("");
}
