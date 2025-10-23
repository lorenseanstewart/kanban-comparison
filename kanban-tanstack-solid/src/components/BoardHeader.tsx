import type { BoardDetails } from "~/lib/api";

export function BoardHeader(props: { data: BoardDetails }) {
  return (
    <div class="space-y-3">
      <div class="badge badge-secondary badge-outline">Board overview</div>
      <h1 class="text-4xl font-black text-primary">{props.data.title}</h1>
      {props.data.description && (
        <p class="text-base text-base-content/60 max-w-2xl">
          {props.data.description}
        </p>
      )}
    </div>
  );
}
