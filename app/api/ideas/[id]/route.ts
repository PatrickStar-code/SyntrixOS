import { NextResponse } from "next/server";
import { requireDbUserId } from "@/lib/auth";
import { sql } from "@/lib/db";
import { UpdateIdeaRequest, IdeaWithTags, ColumnId, Tag } from "@/lib/ideas";

const VALID_STATUSES: ColumnId[] = ["Novo", "Rascunho", "Validando", "Pronto"];

// Type for idea row with aggregated tags from SQL
interface IdeaRow {
  id: string;
  user_id: string;
  content: string;
  description: string | null;
  status: ColumnId;
  created_at: string;
  updated_at: string;
  tags: Tag[];
}

function transformIdea(idea: IdeaRow): IdeaWithTags {
  return {
    id: idea.id,
    user_id: idea.user_id,
    content: idea.content,
    description: idea.description,
    status: idea.status,
    created_at: idea.created_at,
    updated_at: idea.updated_at,
    tags: idea.tags || [],
  };
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await requireDbUserId();
    const { id } = await params;

    const rows = await sql`
      SELECT i.*, 
        COALESCE(
          json_agg(
            json_build_object(
              'id', t.id,
              'user_id', t.user_id,
              'name', t.name,
              'color', t.color,
              'created_at', t.created_at,
              'updated_at', t.updated_at
            )
          ) FILTER (WHERE t.id IS NOT NULL),
          '[]'
        ) as tags
      FROM ideas i
      LEFT JOIN idea_tags it ON it.idea_id = i.id
      LEFT JOIN tags t ON t.id = it.tag_id
      WHERE i.id = ${id} AND i.user_id = ${userId}
      GROUP BY i.id
    `;

    const idea = rows[0] as IdeaRow | undefined;

    if (!idea) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    return NextResponse.json(transformIdea(idea));
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("DB ERROR (fetch idea):", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await requireDbUserId();
    const { id } = await params;

    let body: UpdateIdeaRequest;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};

    if (body.content !== undefined) {
      if (!body.content.trim()) {
        return NextResponse.json(
          { error: "Idea content cannot be empty" },
          { status: 400 },
        );
      }
      updateData.content = body.content.trim();
    }

    if (body.description !== undefined) {
      updateData.description = body.description?.trim() || null;
    }

    if (body.status !== undefined) {
      if (!VALID_STATUSES.includes(body.status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      updateData.status = body.status;
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

    // Add updated_at
    setClauses.push(`updated_at = NOW()`);

    // Add user_id and id checks
    values.push(userId);
    values.push(id);

    const query = `
      UPDATE ideas 
      SET ${setClauses.join(", ")}
      WHERE user_id = $${paramIndex} AND id = $${paramIndex + 1}
      RETURNING *
    `;

    const updatedRows = await sql.unsafe(query, values);
    const updatedIdea = updatedRows[0];

    if (!updatedIdea) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    // Update tag associations if provided
    if (body.tagIds !== undefined) {
      // Delete existing associations
      await sql`DELETE FROM idea_tags WHERE idea_id = ${id}`;

      // Insert new associations
      if (body.tagIds.length > 0) {
        await sql`
          INSERT INTO idea_tags (idea_id, tag_id)
          SELECT ${id}, unnest(${body.tagIds.join(",")}::uuid[])
          ON CONFLICT DO NOTHING
        `;
      }
    }

    // Fetch the updated idea with tags
    const ideaRows = await sql`
      SELECT i.*, 
        COALESCE(
          json_agg(
            json_build_object(
              'id', t.id,
              'user_id', t.user_id,
              'name', t.name,
              'color', t.color,
              'created_at', t.created_at,
              'updated_at', t.updated_at
            )
          ) FILTER (WHERE t.id IS NOT NULL),
          '[]'
        ) as tags
      FROM ideas i
      LEFT JOIN idea_tags it ON it.idea_id = i.id
      LEFT JOIN tags t ON t.id = it.tag_id
      WHERE i.id = ${id} AND i.user_id = ${userId}
      GROUP BY i.id
    `;

    const ideaWithTags = ideaRows[0] as IdeaRow | undefined;

    return NextResponse.json(transformIdea(ideaWithTags!));
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("DB ERROR (update idea):", error);
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
      DELETE FROM ideas 
      WHERE user_id = ${userId} AND id = ${id}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("DB ERROR (delete idea):", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
