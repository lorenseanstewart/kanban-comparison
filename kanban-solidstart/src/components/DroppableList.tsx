import { createDroppable } from "@thisbeyond/solid-dnd";
import { type JSX, Show, createSignal, onMount } from "solid-js";

export function DroppableList(props: {
  listId: string;
  children: JSX.Element;
}) {
  const [mounted, setMounted] = createSignal(false);

  onMount(() => {
    setMounted(true);
  });

  return (
    <Show when={mounted()} fallback={props.children}>
      <DroppableContent listId={props.listId}>
        {props.children}
      </DroppableContent>
    </Show>
  );
}

function DroppableContent(props: {
  listId: string;
  children: JSX.Element;
}) {
  const droppable = createDroppable(`list-${props.listId}`);

  return (
    <div
      // @ts-ignore - solid-dnd custom directive
      use:droppable
      classList={{
        "ring-4 ring-primary ring-offset-2 bg-primary/5 scale-[1.02] transition-all duration-200": droppable.isActiveDroppable,
      }}
    >
      {props.children}
    </div>
  );
}