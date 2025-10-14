import { query } from "@solidjs/router";
export { createBoardAction } from "./board-actions";
export { createCardAction, updateCardAction, addCommentAction } from "./card-actions";
export { updateCardListAction, updateCardPositionsAction } from "./drag-drop-actions";

type BoardId = { id: string };

export const listBoards = query(async () => {
  const { getBoards } = await import("./boards");
  return getBoards();
}, "boards:list");

export const fetchBoard = query(async (input: BoardId) => {
  const { getBoard } = await import("./boards");
  return getBoard(input.id);
}, "boards:detail");

export const listUsers = query(async () => {
  const { getUsers } = await import("./boards");
  return getUsers();
}, "users:list");

export const listTags = query(async () => {
  const { getTags } = await import("./boards");
  return getTags();
}, "tags:list");