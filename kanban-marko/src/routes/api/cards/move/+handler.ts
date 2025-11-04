import { updateCardList } from "../../../../lib/actions";

export const POST = async (context: { request: Request }) => {
  const body = await context.request.json();
  const { cardId, targetListId } = body;

  if (!cardId || !targetListId) {
    return new Response(
      JSON.stringify({ success: false, error: "cardId and targetListId are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const d1 = context.platform?.env?.DB || context.env?.DB;
    const result = await updateCardList(cardId, targetListId, undefined, d1);
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
