import { getBoards } from "@/lib/api";
import { HomePageClient } from "@/components/HomePageClient";

export default async function Home() {
  const boards = await getBoards();

  return <HomePageClient initialBoards={boards} />;
}
