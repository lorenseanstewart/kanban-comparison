import { action, json } from "@solidjs/router";
import * as v from "valibot";
import { boards, lists } from "../../drizzle/schema";
import { BoardSchema } from "../lib/validation";
import { db } from "./db";

export const createBoardAction = action(async (formData: FormData) => {
  "use server";
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;

  const result = v.safeParse(BoardSchema, {
    title,
    description: description || null,
  });

  if (!result.success) {
    const firstIssue = result.issues[0];
    return { success: false, error: firstIssue.message } as const;
  }

  const boardId = crypto.randomUUID();

  db.transaction((tx) => {
    tx.insert(boards)
      .values({
        id: boardId,
        title: result.output.title,
        description: result.output.description,
      })
      .run();

    const listTitles = ["Todo", "In-Progress", "QA", "Done"];
    tx.insert(lists)
      .values(
        listTitles.map((listTitle, index) => ({
          id: crypto.randomUUID(),
          boardId,
          title: listTitle,
          position: index + 1,
        }))
      )
      .run();
  });

  return json(
    {
      success: true,
      data: {
        id: boardId,
        title: result.output.title,
        description: result.output.description,
      },
    } as const,
    { revalidate: ["boards:list"] }
  );
}, "boards:create");
