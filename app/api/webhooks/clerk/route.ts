import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/backend";

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;

  if (!secret) {
    console.error("CLERK_WEBHOOK_SECRET not defined");
    return new Response("Server configuration error", { status: 500 });
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

    const fullName =
      `${event.data.first_name || ""} ${event.data.last_name || ""}`.trim() ||
      null;
    const avatarUrl = event.data.image_url || null;

    try {
      // Upsert user - insert if not exists, update if exists
      await sql`
        INSERT INTO users (clerk_id, email, full_name, avatar_url)
        VALUES (${event.data.id}, ${email ?? null}, ${fullName}, ${avatarUrl})
        ON CONFLICT (clerk_id) DO UPDATE SET
          email = EXCLUDED.email,
          full_name = EXCLUDED.full_name,
          avatar_url = EXCLUDED.avatar_url,
          updated_at = NOW()
      `;
    } catch (error) {
      console.error("DB ERROR (webhook user upsert):", error);
    }
  }

  if (event.type === "user.updated") {
    const email = event.data.primary_email_address_id
      ? event.data.email_addresses?.find(
          (e) => e.id === event.data.primary_email_address_id,
        )?.email_address
      : event.data.email_addresses?.[0]?.email_address;

    const fullName =
      `${event.data.first_name || ""} ${event.data.last_name || ""}`.trim() ||
      null;
    const avatarUrl = event.data.image_url || null;

    try {
      await sql`
        UPDATE users 
        SET email = ${email ?? null}, 
            full_name = ${fullName}, 
            avatar_url = ${avatarUrl},
            updated_at = NOW()
        WHERE clerk_id = ${event.data.id}
      `;
    } catch (error) {
      console.error("DB ERROR (webhook user update):", error);
    }
  }

  if (event.type === "user.deleted" && event.data.id) {
    try {
      await sql`DELETE FROM users WHERE clerk_id = ${event.data.id}`;
    } catch (error) {
      console.error("DB ERROR (webhook user delete):", error);
    }
  }

  return NextResponse.json({});
}
