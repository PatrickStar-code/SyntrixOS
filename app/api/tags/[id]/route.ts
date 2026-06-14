import { NextResponse } from "next/server";
import { requireDbUserId } from "@/lib/auth";
import { sql } from "@/lib/db";
import { UpdateTagRequest, Tag, TagColor } from "@/lib/ideas";

const VALID_COLORS: TagColor[] = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#64748b",
];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await requireDbUserId();
    const { id } = await params;

    let body: UpdateTagRequest;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) {
      if (!body.name.trim()) {
        return NextResponse.json(
          { error: "Tag name cannot be empty" },
          { status: 400 },
        );
      }
      updateData.name = body.name.trim();
    }

    if (body.color !== undefined) {
      if (!VALID_COLORS.includes(body.color)) {
        return NextResponse.json({ error: "Invalid color" }, { status: 400 });
      }
      updateData.color = body.color;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
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

    // Add user_id check to prevent unauthorized updates
    values.push(userId);
    values.push(id);

    const query = `
      UPDATE tags 
      SET ${setClauses.join(", ")}, updated_at = NOW()
      WHERE user_id = $${paramIndex} AND id = $${paramIndex + 1}
      RETURNING *
    `;

    const result = await sql.unsafe(query, values);

    if (result.length === 0) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    return NextResponse.json(result[0] as unknown as Tag);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("DB ERROR (update tag):", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await requireDbUserId();
    const { id } = await params;

    const result = await sql`
      DELETE FROM tags 
      WHERE user_id = ${userId} AND id = ${id}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("DB ERROR (delete tag):", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
