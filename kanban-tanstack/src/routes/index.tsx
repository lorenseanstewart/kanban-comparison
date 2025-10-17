import { createFileRoute } from '@tanstack/react-router'
import { fetchBoards } from '~/utils/api'
import { HomePageClient } from '~/components/HomePageClient'

export const Route = createFileRoute('/')({
  loader: async () => {
    const boards = await fetchBoards()
    return { boards }
  },
  component: Home,
})

function Home() {
  const { boards } = Route.useLoaderData()
  return <HomePageClient initialBoards={boards} />
}
