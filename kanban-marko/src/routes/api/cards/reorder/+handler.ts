import { updateCardPositions } from "../../../../lib/actions";

export const POST = async (context: { request: Request }) => {
  const body = await context.request.json();
  const { cardIds } = body;

  if (!cardIds || !Array.isArray(cardIds)) {
    return new Response(
      JSON.stringify({ success: false, error: "cardIds array is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const d1 = context.platform?.env?.DB || context.env?.DB;
    const result = await updateCardPositions(cardIds, d1);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
