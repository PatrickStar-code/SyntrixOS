import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/backend";

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

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

  if (event.type === "user.created") {
    const email = event.data.primary_email_address_id
      ? event.data.email_addresses?.find(
          (e) => e.id === event.data.primary_email_address_id,
        )?.email_address
      : event.data.email_addresses?.[0]?.email_address;

    const { error } = await supabase.from("users").upsert(
      {
        clerk_id: event.data.id,
        email: email,
      },
      { onConflict: "clerk_id" },
    );

    if (error) {
      console.error("SUPABASE ERROR:", error);
    }
  }

  return NextResponse.json({});
}
