import { NextResponse } from "next/server";
import { updateCardList } from "@/lib/actions";

export async function POST(request: Request) {
  try {
    const { cardId, targetListId } = await request.json();

    if (!cardId || !targetListId) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters" },
        { status: 400 }
      );
    }

    await updateCardList(cardId, targetListId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to move card:", error);
    return NextResponse.json(
      { success: false, error: "Failed to move card" },
      { status: 500 }
    );
  }
}
