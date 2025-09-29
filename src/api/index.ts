import { query, action } from "@solidjs/router";
import { getBoards, getBoard, getUsers, getTags } from "./boards";

type BoardId = { id: string };

export const listBoards = query(() => getBoards(), "boards:list");
export const fetchBoard = query((input: BoardId) => getBoard(input.id), "boards:detail");
export const listUsers = query(() => getUsers(), "users:list");
export const listTags = query(() => getTags(), "tags:list");

export const createBoard = action(async () => {
  throw new Error("Not implemented");
}, "boards:create");

export const mutateCard = action(async () => {
  throw new Error("Not implemented");
}, "cards:mutate");