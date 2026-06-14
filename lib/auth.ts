import { auth } from "@clerk/nextjs/server";
import { getUserId } from "./db";

/**
 * Get the authenticated user's Clerk ID.
 * Returns null if not authenticated.
 */
export async function getClerkUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

/**
 * Get the authenticated user's internal database UUID.
 * This looks up the users table using the Clerk ID.
 * Returns null if not authenticated or user not found in DB.
 */
export async function getDbUserId(): Promise<string | null> {
  const clerkUserId = await getClerkUserId();
  if (!clerkUserId) return null;
  return getUserId(clerkUserId);
}

/**
 * Require authentication - throws if not authenticated.
 * Returns the Clerk user ID.
 */
export async function requireClerkUserId(): Promise<string> {
  const clerkUserId = await getClerkUserId();
  if (!clerkUserId) {
    throw new Error("Unauthorized");
  }
  return clerkUserId;
}

/**
 * Require authentication - throws if not authenticated or user not in DB.
 * Returns the internal database UUID.
 */
export async function requireDbUserId(): Promise<string> {
  const dbUserId = await getDbUserId();
  if (!dbUserId) {
    throw new Error("Unauthorized");
  }
  return dbUserId;
}
