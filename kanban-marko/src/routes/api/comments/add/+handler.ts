import { addComment } from "../../../../lib/actions";

export const POST = async (context: { request: Request }) => {
  const body = await context.request.json();
  const { cardId, userId, text } = body;

  if (!cardId || !userId || !text) {
    return new Response(
      JSON.stringify({ success: false, error: "cardId, userId, and text are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const result = await addComment({ cardId, userId, text });

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 400,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
