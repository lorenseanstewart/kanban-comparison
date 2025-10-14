import { updateCard } from "../../../../lib/actions";

export const POST = async (context: { request: Request }) => {
  const body = await context.request.json();
  const { cardId, title, description, assigneeId, tagIds } = body;

  if (!cardId || !title) {
    return new Response(
      JSON.stringify({ success: false, error: "cardId and title are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const result = await updateCard({
      cardId,
      title,
      description: description || null,
      assigneeId: assigneeId || null,
      tagIds: tagIds || []
    });

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
