export type AddCommentBody = {
  cardId: string;
  userId: string;
  text: string;
};

export type ApiResult = {
  success: boolean;
  error?: string;
};

export async function addComment(body: AddCommentBody): Promise<ApiResult> {
  const response = await fetch("/api/comments/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await response.json()) as ApiResult;
}
