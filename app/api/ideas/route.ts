import { createClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
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
  const supabase = await createClient();
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  // Build query
  let query = supabase
    .from("ideas")
    .select(
      `
      *,
      idea_tags!inner(
        tag:tags(*)
      )
    `,
      { count: "exact" },
    )
    .eq("user_id", userId);

  // Apply filters
  if (params.status) {
    query = query.eq("status", params.status);
  }

  if (params.tagId) {
    query = query.eq("idea_tags.tag_id", params.tagId);
  }

  if (params.search) {
    query = query.or(
      `content.ilike.%${params.search}%,description.ilike.%${params.search}%`,
    );
  }

  // Apply sorting
  const sortBy = params.sortBy || "created_at";
  const sortOrder = params.sortOrder || "desc";
  query = query.order(sortBy, { ascending: sortOrder === "asc" });

  // Apply pagination
  const limit = params.limit || 50;
  const offset = params.offset || 0;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error("SUPABASE ERROR (fetch ideas):", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Transform data to include tags array
  function toIdeaWithTags(idea: {
    id: string;
    user_id: string;
    content: string;
    description: string | null;
    status: ColumnId;
    created_at: string;
    updated_at: string;
    idea_tags?: Array<{ tag: Tag }>;
  }): IdeaWithTags {
    return {
      id: idea.id,
      user_id: idea.user_id,
      content: idea.content,
      description: idea.description,
      status: idea.status,
      created_at: idea.created_at,
      updated_at: idea.updated_at,
      tags: idea.idea_tags?.map((it) => it.tag).filter(Boolean) || [],
    };
  }

  const ideas: IdeaWithTags[] = (data || []).map(toIdeaWithTags);

  return NextResponse.json({
    ideas,
    total: count || 0,
    limit,
    offset,
  } as IdeasResponse);
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
    body.status && VALID_STATUSES.includes(body.status) ? body.status : "Novo";

  // Create the idea
  const { data: idea, error: ideaError } = await supabase
    .from("ideas")
    .insert({
      user_id: userId,
      content: body.content.trim(),
      description: body.description?.trim() || null,
      status,
    })
    .select()
    .single();

  if (ideaError) {
    console.error("SUPABASE ERROR (create idea):", ideaError);
    return NextResponse.json({ error: ideaError.message }, { status: 500 });
  }

  // Create tag associations if provided
  if (body.tagIds && body.tagIds.length > 0) {
    const tagInserts = body.tagIds.map((tagId) => ({
      idea_id: idea.id,
      tag_id: tagId,
    }));

    const { error: tagError } = await supabase
      .from("idea_tags")
      .insert(tagInserts);

    if (tagError) {
      console.error("SUPABASE ERROR (create idea_tags):", tagError);
      // Don't fail the request, just log the error
    }
  }

  // Fetch the created idea with tags
  const { data: ideaWithTags } = await supabase
    .from("ideas")
    .select(
      `
      *,
      idea_tags!inner(
        tag:tags(*)
      )
    `,
    )
    .eq("id", idea.id)
    .eq("user_id", userId)
    .single();

  function transformIdea(idea: {
    id: string;
    user_id: string;
    content: string;
    description: string | null;
    status: ColumnId;
    created_at: string;
    updated_at: string;
    idea_tags?: Array<{ tag: Tag }>;
  }): IdeaWithTags {
    return {
      id: idea.id,
      user_id: idea.user_id,
      content: idea.content,
      description: idea.description,
      status: idea.status,
      created_at: idea.created_at,
      updated_at: idea.updated_at,
      tags: idea.idea_tags?.map((it) => it.tag).filter(Boolean) || [],
    };
  }

  const transformedIdea: IdeaWithTags = transformIdea(ideaWithTags!);

  return NextResponse.json(transformedIdea, { status: 201 });
}
