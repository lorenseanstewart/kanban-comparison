import { getBoards } from "../lib/api";

export async function GET(context: any) {
  try {
    const boards = await getBoards();

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
