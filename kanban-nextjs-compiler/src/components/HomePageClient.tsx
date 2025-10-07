"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { BoardSummary } from "@/lib/api";
import { AddBoardModal } from "./AddBoardModal";

export function HomePageClient({
  initialBoards,
}: {
  initialBoards: BoardSummary[];
}) {
  const [boards, setBoards] = useState<BoardSummary[]>(initialBoards);

  // Sync local state with server data when initialBoards changes
  useEffect(() => {
    setBoards(initialBoards);
  }, [initialBoards]);

  // Handle board creation with server-generated ID
  const handleBoardAdd = (boardData: {
    id: string;
    title: string;
    description: string | null;
  }) => {
    setBoards((prev) => [...prev, boardData]);
  };

  return (
    <main className="w-full max-w-4xl mx-auto p-8 space-y-10 rounded-[2.5rem] bg-base-100 dark:bg-base-200 shadow-xl">
      <header className="text-center space-y-3">
        <p className="text-sm uppercase tracking-wide text-secondary">
          Your workspace
        </p>
        <h1 className="text-4xl font-black text-primary">Boards</h1>
        <p className="text-base text-base-content/60">
          Choose a board to jump into your Kanban flow.
        </p>
      </header>

      <div className="flex justify-end">
        <AddBoardModal onBoardAdd={handleBoardAdd} />
      </div>

      <section className="grid gap-8 md:grid-cols-2">
        {boards.length === 0 ? (
          <div className="card bg-base-200 dark:bg-base-300 shadow-xl">
            <div className="card-body items-center text-center">
              <h2 className="card-title text-secondary">No boards yet</h2>
              <p className="text-base-content/60">
                Create your first board to get started.
              </p>
            </div>
          </div>
        ) : (
          boards.map((board) => (
            <Link
              key={board.id}
              href={`/board/${board.id}`}
              className="card bg-base-200 dark:bg-base-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all"
            >
              <div className="card-body">
                <h2 className="card-title text-primary">{board.title}</h2>
                {board.description ? (
                  <p className="text-sm text-base-content/60">
                    {board.description}
                  </p>
                ) : (
                  <p className="badge badge-secondary badge-outline w-fit shadow">
                    No description
                  </p>
                )}
                <div className="card-actions justify-end">
                  <span className="btn btn-secondary btn-sm shadow-lg">
                    Open board
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </section>
    </main>
  );
}
