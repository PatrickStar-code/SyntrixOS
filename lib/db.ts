import postgres from "postgres";

// Neon connection string from environment variable
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create the postgres client with connection pooling
// Neon supports pooled connections via pgbouncer
export const sql = postgres(connectionString, {
  // Connection pool settings
  max: 10, // Maximum number of connections
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout in seconds

  // Neon-specific: prepare statements for better performance
  prepare: false, // Disable prepared statements for serverless (pgbouncer compatibility)

  // Transform camelCase to snake_case for database columns
  transform: {
    column: {
      to: (column: string) => column.replace(/([A-Z])/g, "_$1").toLowerCase(),
      from: (column: string) =>
        column.replace(/(_[a-z])/g, (g) => g[1].toUpperCase()),
    },
  },

  // Debug mode (set to true in development for logging)
  debug:
    process.env.NODE_ENV === "development"
      ? (connection, query, params) => {
          console.log("[DB]", query, params);
        }
      : false,
});

// Helper to get user's internal UUID from Clerk ID
export async function getUserId(clerkId: string): Promise<string | null> {
  const result = await sql`
    SELECT id FROM users WHERE clerk_id = ${clerkId}
  `;
  return result[0]?.id || null;
}

// Helper to ensure user exists (create if not exists via webhook sync)
export async function ensureUser(
  clerkId: string,
  email: string,
  fullName?: string,
  avatarUrl?: string,
): Promise<string> {
  const existing = await getUserId(clerkId);
  if (existing) return existing;

  const result = await sql`
    INSERT INTO users (clerk_id, email, full_name, avatar_url)
    VALUES (${clerkId}, ${email}, ${fullName || null}, ${avatarUrl || null})
    RETURNING id
  `;
  return result[0].id;
}

// Type helpers for common queries
export type { postgres };

// Export a function to close the connection pool (useful for testing/serverless cleanup)
export async function closePool() {
  await sql.end();
}
