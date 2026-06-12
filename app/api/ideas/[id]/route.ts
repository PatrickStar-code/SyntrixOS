import { createClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { UpdateIdeaRequest, IdeaWithTags, ColumnId, Tag } from "@/lib/ideas";

const VALID_STATUSES: ColumnId[] = ["Novo", "Rascunho", "Validando", "Pronto"];

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const { userId } = await auth();
  const { id } = await params;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("ideas")
    .select(
      `
      *,
      idea_tags!inner(
        tag:tags(*)
      )
    `,
    )
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }
    console.error("SUPABASE ERROR (fetch idea):", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

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

  const transformedIdea: IdeaWithTags = transformIdea(data);

  return NextResponse.json(transformedIdea);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const { userId } = await auth();
  const { id } = await params;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  // Update the idea
  const { error: ideaError } = await supabase
    .from("ideas")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (ideaError) {
    if (ideaError.code === "PGRST116") {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }
    console.error("SUPABASE ERROR (update idea):", ideaError);
    return NextResponse.json({ error: ideaError.message }, { status: 500 });
  }

  // Update tag associations if provided
  if (body.tagIds !== undefined) {
    // Delete existing associations
    await supabase.from("idea_tags").delete().eq("idea_id", id);

    // Insert new associations
    if (body.tagIds.length > 0) {
      const tagInserts = body.tagIds.map((tagId) => ({
        idea_id: id,
        tag_id: tagId,
      }));

      await supabase.from("idea_tags").insert(tagInserts);
    }
  }

  // Fetch the updated idea with tags
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
    .eq("id", id)
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

  return NextResponse.json(transformedIdea);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const { userId } = await auth();
  const { id } = await params;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("ideas")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("SUPABASE ERROR (delete idea):", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
