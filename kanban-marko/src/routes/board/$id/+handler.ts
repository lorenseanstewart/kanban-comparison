import { getBoard, getUsers, getTags } from "../../../lib/api";

export async function GET(context: any) {
  const boardId = context.params.id;

  try {
    const [boardData, allUsers, allTags] = await Promise.all([
      getBoard(boardId),
      getUsers(),
      getTags(),
    ]);

    if (!boardData) {
      return new Response("Board not found", { status: 404 });
    }

    // Set the board data in context so the page can access it via $global
    context.meta = {
      ...context.meta,
      pageTitle: boardData.title,
    };

    // Store board data for the page component
    context.board = boardData;
    context.allUsers = allUsers;
    context.allTags = allTags;
  } catch (error) {
    console.error("Error fetching board:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
