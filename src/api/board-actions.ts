"use server";

import { db } from "./db";
import { boards, lists } from "../../drizzle/schema";
import { revalidate } from "@solidjs/router";

export async function createBoard(formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    if (!title) {
      throw new Error("Board title is required");
    }

    if (title.trim().length === 0) {
      throw new Error("Title cannot be empty");
    }

    if (title.length > 255) {
      throw new Error("Title must be less than 255 characters");
    }

    if (description && description.length > 500) {
      throw new Error("Description must be less than 500 characters");
    }

    // Create the board
    const boardId = crypto.randomUUID();

    await db.insert(boards).values({
      id: boardId,
      title,
      description: description || null,
    });

    // Create the four default lists for the board
    const listTitles = ["Todo", "In-Progress", "QA", "Done"];
    await db.insert(lists).values(
      listTitles.map((listTitle, index) => ({
        id: crypto.randomUUID(),
        boardId,
        title: listTitle,
        position: index + 1,
      }))
    );

    revalidate(["boards:list"]);
  } catch (error) {
    console.error("Failed to create board:", error);
    throw new Error("Failed to create board. Please try again.");
  }
}
