import { createBoard } from "../../../../lib/actions";

export const POST = async (context: { request: Request }) => {
  const body = await context.request.json();
  const { title, description } = body;

  if (!title) {
    return new Response(
      JSON.stringify({ success: false, error: "title is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const d1 = context.platform?.env?.DB || context.env?.DB;
    const result = await createBoard({
      title,
      description: description || null
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
