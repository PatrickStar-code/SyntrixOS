import { NextResponse } from "next/server";
import { requireDbUserId, getClerkUserId } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const clerkUserId = await getClerkUserId();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user by clerk_id
    const [user] = await sql`
      SELECT * FROM users WHERE clerk_id = ${clerkUserId}
    `;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("DB ERROR (fetch user):", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const dbUserId = await requireDbUserId();

    const body = await req.json();

    // Only allow updating specific fields
    const allowedFields = ["full_name", "avatar_url"];
    const updateData: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    // Build dynamic update query
    const setClauses: string[] = [];
    const values: (string | number | boolean | null)[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updateData)) {
      const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
      setClauses.push(`${snakeKey} = $${paramIndex}`);
      values.push(value as string | number | boolean | null);
      paramIndex++;
    }

    setClauses.push(`updated_at = NOW()`);

    values.push(dbUserId);

    const query = `
      UPDATE users 
      SET ${setClauses.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const [updatedUser] = await sql.unsafe(query, values);

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("DB ERROR (update user):", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
