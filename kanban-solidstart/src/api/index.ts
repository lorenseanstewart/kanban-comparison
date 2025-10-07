import { query } from "@solidjs/router";
import { getBoards, getBoard, getUsers, getTags } from "./boards";
export { createBoardAction } from "./board-actions";
export { createCardAction, updateCardAction, addCommentAction } from "./card-actions";
export { updateCardListAction, updateCardPositionsAction } from "./drag-drop-actions";

type BoardId = { id: string };

export const listBoards = query(() => getBoards(), "boards:list");
export const fetchBoard = query((input: BoardId) => getBoard(input.id), "boards:detail");
export const listUsers = query(() => getUsers(), "users:list");
export const listTags = query(() => getTags(), "tags:list");