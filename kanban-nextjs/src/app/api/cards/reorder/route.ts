import { NextResponse } from "next/server";
import { updateCardPositions } from "@/lib/actions";

export async function POST(request: Request) {
  try {
    const { cardIds } = await request.json();

    if (!Array.isArray(cardIds)) {
      return NextResponse.json(
        { success: false, error: "Invalid card IDs" },
        { status: 400 }
      );
    }

    await updateCardPositions(cardIds);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to reorder cards:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reorder cards" },
      { status: 500 }
    );
  }
}
