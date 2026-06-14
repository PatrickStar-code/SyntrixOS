#!/usr/bin/env node

import {
  runMigrations,
  rollbackLastMigration,
  showMigrationStatus,
} from "@/lib/migrations";
import { closePool } from "@/lib/db";

async function main() {
  const command = process.argv[2] || "up";

  try {
    switch (command) {
      case "up":
      case "migrate":
        await runMigrations();
        break;
      case "down":
      case "rollback":
        await rollbackLastMigration();
        break;
      case "status":
      case "list":
        await showMigrationStatus();
        break;
      default:
        console.log(`
Usage: npm run db:migrate [command]

Commands:
  up, migrate    Run all pending migrations (default)
  down, rollback Rollback last migration (removes record only)
  status, list   Show migration status
        `);
        process.exit(1);
    }
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

main();
