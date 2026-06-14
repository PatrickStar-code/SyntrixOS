import { NextResponse } from "next/server";
import { requireDbUserId } from "@/lib/auth";
import { sql } from "@/lib/db";
import {
  CreateIdeaRequest,
  IdeasQueryParams,
  IdeasResponse,
  ColumnId,
  IdeaWithTags,
  Tag,
} from "@/lib/ideas";

const VALID_STATUSES: ColumnId[] = ["Novo", "Rascunho", "Validando", "Pronto"];
const VALID_SORT_FIELDS = ["created_at", "updated_at"] as const;
const VALID_SORT_ORDERS = ["asc", "desc"] as const;

export async function GET(req: Request) {
  try {
    const userId = await requireDbUserId();

    const { searchParams } = new URL(req.url);

    // Parse query parameters
    const params: IdeasQueryParams = {};
    if (searchParams.has("status")) {
      const status = searchParams.get("status");
      if (VALID_STATUSES.includes(status as ColumnId)) {
        params.status = status as ColumnId;
      }
    }
    if (searchParams.has("tagId")) {
      params.tagId = searchParams.get("tagId")!;
    }
    if (searchParams.has("search")) {
      params.search = searchParams.get("search")!;
    }
    if (searchParams.has("limit")) {
      params.limit = parseInt(searchParams.get("limit")!, 10);
    }
    if (searchParams.has("offset")) {
      params.offset = parseInt(searchParams.get("offset")!, 10);
    }
    if (
      searchParams.has("sortBy") &&
      VALID_SORT_FIELDS.includes(
        searchParams.get("sortBy")! as (typeof VALID_SORT_FIELDS)[number],
      )
    ) {
      params.sortBy = searchParams.get(
        "sortBy",
      )! as (typeof VALID_SORT_FIELDS)[number];
    }
    if (
      searchParams.has("sortOrder") &&
      VALID_SORT_ORDERS.includes(
        searchParams.get("sortOrder")! as (typeof VALID_SORT_ORDERS)[number],
      )
    ) {
      params.sortOrder = searchParams.get(
        "sortOrder",
      )! as (typeof VALID_SORT_ORDERS)[number];
    }

    // Build query for tags
    const sortBy = params.sortBy || "created_at";
    const sortOrder = params.sortOrder || "desc";
    const limit = params.limit || 50;
    const offset = params.offset || 0;

    // First, get the count for pagination
    let countSql = `
      SELECT COUNT(*) as total
      FROM ideas
      WHERE user_id = $1
    `;
    let countParams: (string | number | boolean | null)[] = [userId];

    if (params.status) {
      countSql = `
        SELECT COUNT(*) as total
        FROM ideas
        WHERE user_id = $1 AND status = $2
      `;
      countParams.push(params.status);
    }

    if (params.tagId) {
      countSql = `
        SELECT COUNT(*) as total
        FROM ideas i
        JOIN idea_tags it ON it.idea_id = i.id
        WHERE i.user_id = $1 AND it.tag_id = $2
      `;
      countParams = [userId, params.tagId];
    }

    if (params.search) {
      const searchTerm = `%${params.search}%`;
      countSql = `
        SELECT COUNT(*) as total
        FROM ideas
        WHERE user_id = $1
        AND (content ILIKE $2 OR description ILIKE $2)
      `;
      countParams = [userId, searchTerm];
    }

    const [{ total }] = await sql.unsafe(countSql, countParams);

    // Now get the actual data with tags
    let query = `
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
      WHERE i.user_id = $1
    `;
    const queryParams: (string | number | boolean | null)[] = [userId];
    let paramIndex = 2;

    if (params.status) {
      query += ` AND i.status = $${paramIndex}`;
      queryParams.push(params.status);
      paramIndex++;
    }

    if (params.tagId) {
      query += ` AND EXISTS (
        SELECT 1 FROM idea_tags it2 
        WHERE it2.idea_id = i.id AND it2.tag_id = $${paramIndex}
      )`;
      queryParams.push(params.tagId);
      paramIndex++;
    }

    if (params.search) {
      const searchTerm = `%${params.search}%`;
      query += ` AND (i.content ILIKE $${paramIndex} OR i.description ILIKE $${paramIndex})`;
      queryParams.push(searchTerm);
      paramIndex++;
    }

    query += ` GROUP BY i.id ORDER BY i.${sortBy} ${sortOrder.toUpperCase()} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    const ideas = await sql.unsafe(query, queryParams);

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

    function toIdeaWithTags(idea: IdeaRow): IdeaWithTags {
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

    const transformedIdeas: IdeaWithTags[] = (
      ideas as unknown as IdeaRow[]
    ).map(toIdeaWithTags);

    return NextResponse.json({
      ideas: transformedIdeas,
      total: Number(total),
      limit,
      offset,
    } as IdeasResponse);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("DB ERROR (fetch ideas):", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const userId = await requireDbUserId();

    let body: CreateIdeaRequest;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    if (!body.content || !body.content.trim()) {
      return NextResponse.json(
        { error: "Idea content is required" },
        { status: 400 },
      );
    }

    const status =
      body.status && VALID_STATUSES.includes(body.status)
        ? body.status
        : "Novo";

    // Create the idea
    const [idea] = await sql`
      INSERT INTO ideas (user_id, content, description, status)
      VALUES (${userId}, ${body.content.trim()}, ${body.description?.trim() || null}, ${status})
      RETURNING *
    `;

    // Create tag associations if provided
    if (body.tagIds && body.tagIds.length > 0) {
      await sql`
        INSERT INTO idea_tags (idea_id, tag_id)
        SELECT ${idea.id}, unnest(${body.tagIds.join(",")}::uuid[])
        ON CONFLICT DO NOTHING
      `;
    }

    // Fetch the created idea with tags
    const [ideaWithTags] = await sql`
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
      WHERE i.id = ${idea.id} AND i.user_id = ${userId}
      GROUP BY i.id
    `;

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

    const transformedIdea: IdeaWithTags = transformIdea(
      ideaWithTags as unknown as IdeaRow,
    );

    return NextResponse.json(transformedIdea, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("DB ERROR (create idea):", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
