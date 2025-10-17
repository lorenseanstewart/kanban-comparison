import { createFileRoute, notFound } from '@tanstack/react-router'
import { fetchBoard, fetchUsers, fetchTags } from '~/utils/api'
import { BoardPageClient } from '~/components/BoardPageClient'

export const Route = createFileRoute('/board/$id')({
  loader: async ({ params }) => {
    const [boardData, allUsers, allTags] = await Promise.all([
      fetchBoard({ data: params.id }),
      fetchUsers(),
      fetchTags(),
    ])

    if (!boardData) {
      throw notFound()
    }

    return { boardData, allUsers, allTags }
  },
  component: BoardPage,
})

function BoardPage() {
  const { boardData, allUsers, allTags } = Route.useLoaderData()

  return (
    <BoardPageClient
      initialBoard={boardData}
      allUsers={allUsers}
      allTags={allTags}
    />
  )
}
