import { createClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
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
  const supabase = await createClient();
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("SUPABASE ERROR (fetch tags):", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data as Tag[]);
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  const { data, error } = await supabase
    .from("tags")
    .insert({
      user_id: userId,
      name: body.name.trim(),
      color,
    })
    .select()
    .single();

  if (error) {
    console.error("SUPABASE ERROR (create tag):", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data as Tag, { status: 201 });
}
