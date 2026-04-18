import { createClient } from "@/lib/supabase/client";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/backend";

export async function POST(req: Request) {
  const supabase = createClient();

  const secret = process.env.CLERK_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error("CLERK_WEBHOOK_SECRET não definido");
  }

  const wh = new Webhook(secret);

  const payload = await req.text();
  const headers = req.headers;

  let event: WebhookEvent;

  try {
    event = wh.verify(payload, {
      "svix-id": headers.get("svix-id")!,
      "svix-timestamp": headers.get("svix-timestamp")!,
      "svix-signature": headers.get("svix-signature")!,
    }) as WebhookEvent;
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  console.log("EVENT TYPE:", event.type);

  if (event.type === "user.created") {
    const user = event.data;

    const name = `${user.first_name || ""} ${user.last_name || ""}`.trim();
    const now = new Date().toISOString();

    await supabase.from("accounts").upsert(
      {
        user_id: user.id,
        name,
        created_at: now,
        updated_at: now,
      },
      { onConflict: "user_id" },
    );
  }

  return NextResponse.json({ success: true });
}
