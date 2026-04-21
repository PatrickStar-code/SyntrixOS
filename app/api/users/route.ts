import { createClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const supabase = await createClient();
  const { userId } = await auth();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("clerk_id", userId)
    .single();

  if (error) {
    return new Response(error.message, { status: 400 });
  }

  return Response.json(data);
}

export async function PATCH(req: Request) {
  const supabase = await createClient();
  const { userId } = await auth();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();

  const { data, error } = await supabase
    .from("users")
    .update(body)
    .eq("clerk_id", userId)
    .select()
    .single();

  if (error) {
    return new Response(error.message, { status: 400 });
  }

  return Response.json(data);
}
