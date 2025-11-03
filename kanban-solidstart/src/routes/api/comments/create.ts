/// <reference types="@cloudflare/workers-types" />
import { getD1Binding, getDatabase } from "~/api/db";
import { comments } from "../../../../drizzle/schema";
import * as v from "valibot";
import { CommentSchema } from "~/lib/validation";

export async function POST({ request }: { request: Request }) {
  try {
    const d1 = getD1Binding();
    const db = getDatabase(d1);

    const body = (await request.json()) as { cardId: string; userId: string; text: string };
    const { cardId, userId, text } = body;

    // Validate with Valibot
    const result = v.safeParse(CommentSchema, {
      cardId,
      userId,
      text,
    });

    if (!result.success) {
      const firstIssue = result.issues[0];
      return new Response(JSON.stringify({ success: false, error: firstIssue.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const commentId = crypto.randomUUID();

    await db.insert(comments).values({
      id: commentId,
      cardId: result.output.cardId,
      userId: result.output.userId,
      text: result.output.text,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to add comment:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to add comment. Please try again.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
