import { getBoards } from "../lib/api";

export async function GET(context: any) {
  try {
    // Access D1 database binding from Cloudflare context
    const d1 = context.platform?.env?.DB || context.env?.DB;
    const boards = await getBoards(d1);

    context.meta = {
      ...context.meta,
      pageTitle: "Kanban Board - Your Workspace",
    };

    context.boards = boards;
  } catch (error) {
    console.error("Error fetching boards:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
