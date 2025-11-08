import type { BoardDetails } from "@/lib/api";

export function BoardHeader({ data }: { data: BoardDetails }) {
  return (
    <div className="space-y-3">
      <div className="badge badge-secondary badge-outline">Board overview</div>
      <h1 className="text-4xl font-black text-primary">{data.title}</h1>
      {data.description && (
        <p className="text-base text-base-content/60 max-w-2xl">
          {data.description}
        </p>
      )}
    </div>
  );
}
