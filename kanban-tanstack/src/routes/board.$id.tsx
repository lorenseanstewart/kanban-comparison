import { createFileRoute, notFound, Link } from '@tanstack/react-router'
import { fetchBoard, fetchUsers, fetchTags } from '~/utils/api'
import { BoardPageClient } from '~/components/BoardPageClient'

function LoadingFallback() {
  return (
    <main className="w-full p-8 space-y-10 rounded-3xl bg-base-100 dark:bg-base-200 shadow-xl">
      <div className="breadcrumbs text-sm">
        <ul>
          <li>
            <Link to="/" className="link link-hover">
              Boards
            </Link>
          </li>
          <li>
            <span className="text-base-content/60">Loading...</span>
          </li>
        </ul>
      </div>
      <div className="flex justify-center py-16">
        <span
          className="loading loading-spinner loading-lg text-primary"
          aria-label="Loading board"
        />
      </div>
    </main>
  )
}

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
  pendingComponent: LoadingFallback,
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
