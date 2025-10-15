export type CreateCardBody = {
  boardId: string;
  title: string;
  description: string | null;
  assigneeId: string | null;
  tagIds: string[];
};

export type UpdateCardBody = {
  cardId: string;
  title: string;
  description: string | null;
  assigneeId: string | null;
  tagIds: string[];
};

export type ApiResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function createCard(
  body: CreateCardBody
): Promise<ApiResult<{ id: string }>> {
  const response = await fetch("/api/cards/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await response.json()) as ApiResult<{ id: string }>;
}

export async function updateCard(body: UpdateCardBody): Promise<ApiResult> {
  const response = await fetch("/api/cards/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await response.json()) as ApiResult;
}

export async function deleteCard(cardId: string): Promise<ApiResult> {
  const response = await fetch("/api/cards/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cardId }),
  });
  return (await response.json()) as ApiResult;
}
