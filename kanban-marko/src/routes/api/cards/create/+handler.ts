import { createCard } from "../../../../lib/actions";

export const POST = async (context: { request: Request }) => {
  const body = await context.request.json();
  const { boardId, title, description, assigneeId, tagIds } = body;

  if (!boardId || !title) {
    return new Response(
      JSON.stringify({ success: false, error: "boardId and title are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const result = await createCard({
      boardId,
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
