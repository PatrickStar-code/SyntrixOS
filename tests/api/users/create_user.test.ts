import { POST } from "@/app/api/webhooks/clerk/route";
import { test, expect, vi, beforeAll } from "vitest";

beforeAll(() => {
  process.env.CLERK_WEBHOOK_SECRET = "test_secret";
  process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
});

vi.mock("svix", () => {
  return {
    Webhook: class {
      verify() {
        return {
          type: "user.created",
          data: {
            id: "user_123",
            email_addresses: [{ email_address: "test@example.com" }],
          },
        };
      }
    },
  };
});

vi.mock("@/lib/db", () => {
  const mockSql = vi.fn().mockResolvedValue([]);
  mockSql.unsafe = vi.fn().mockResolvedValue([]);
  return {
    sql: mockSql,
  };
});

test("create_user using clerk", async () => {
  const request = new Request(
    "https://syntrix-os.vercel.app/api/webhooks/clerk",
    {
      method: "POST",
      headers: {
        "svix-id": "test",
        "svix-timestamp": "test",
        "svix-signature": "test",
      },
      body: JSON.stringify({
        type: "user.created",
        data: {
          id: "user_123",
          email_addresses: [
            {
              email_address: "test@example.com",
            },
          ],
          first_name: "Patrick",
          last_name: "Star",
        },
      }),
    },
  );

  const result = await POST(request);

  const data = await result.json();

  expect(result.status).toBe(200);
  expect(data).toEqual({});
});
