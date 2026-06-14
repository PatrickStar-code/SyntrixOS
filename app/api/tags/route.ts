import { NextResponse } from "next/server";
import { requireDbUserId } from "@/lib/auth";
import { sql } from "@/lib/db";
import { CreateTagRequest, Tag, TagColor } from "@/lib/ideas";

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

export async function GET() {
  try {
    const userId = await requireDbUserId();

    const tags = await sql<Tag[]>`
      SELECT * FROM tags 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    return NextResponse.json(tags);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("DB ERROR (fetch tags):", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const userId = await requireDbUserId();

    let body: CreateTagRequest;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { error: "Tag name is required" },
        { status: 400 },
      );
    }

    const color =
      body.color && VALID_COLORS.includes(body.color as TagColor)
        ? body.color
        : VALID_COLORS[0];

    const [tag] = await sql<Tag[]>`
      INSERT INTO tags (user_id, name, color)
      VALUES (${userId}, ${body.name.trim()}, ${color})
      RETURNING *
    `;

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("DB ERROR (create tag):", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
