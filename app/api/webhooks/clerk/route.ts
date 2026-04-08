import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
);

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.type === "user.created") {
    const user = body.data;

    await supabase.from("accounts").insert({
      user_id: user.id,
      name: `${user.first_name} ${user.last_name}`,
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  return NextResponse.json({ success: true });
}
