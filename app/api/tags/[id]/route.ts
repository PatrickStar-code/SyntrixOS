import { createClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
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
  const supabase = await createClient();
  const { userId } = await auth();
  const { id } = await params;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("tags")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }
    console.error("SUPABASE ERROR (update tag):", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data as Tag);
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
    .from("tags")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("SUPABASE ERROR (delete tag):", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
